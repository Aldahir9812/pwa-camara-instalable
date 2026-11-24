// ============================================================================
// Inspección Visual PWA - app.js
// Lógica Multiplataforma (iOS & Android): Detección de Capacidades, PWA, UX Ética y Cámara
// Restricciones Académicas: 100% Vanilla JS, Cero async/await (solo Promesas .then / .catch)
// ============================================================================

// Referencias a elementos del DOM
var visorVideo = document.getElementById('visor-camara');
var visorContainer = document.querySelector('.visor-container');
var placeholderCamara = document.getElementById('placeholder-camara');
var badgeLente = document.getElementById('badge-lente');
var textoLente = document.getElementById('texto-lente');
var mensajeEstado = document.getElementById('mensaje-estado');
var indicadorPlataforma = document.getElementById('indicador-plataforma');
var indicadorEntorno = document.getElementById('indicador-entorno');

// Elementos de instalación
var seccionInstalacionChromium = document.getElementById('seccion-instalacion-chromium');
var btnInstalar = document.getElementById('btn-instalar');
var instruccionesIOS = document.getElementById('instrucciones-ios');
var instruccionesAndroid = document.getElementById('instrucciones-android');

// Elementos de Pre-Permiso UX
var btnPrepararCamara = document.getElementById('btn-preparar-camara');
var avisoPermiso = document.getElementById('aviso-permiso');
var btnConfirmarPermiso = document.getElementById('btn-confirmar-permiso');
var btnCancelarPermiso = document.getElementById('btn-cancelar-permiso');

// Controles de hardware
var grupoControlesActivos = document.getElementById('grupo-controles-activos');
var btnAlternarCamara = document.getElementById('btn-alternar-camara');
var btnApagarCamara = document.getElementById('btn-apagar-camara');

// Variables de estado del ciclo de vida y hardware
var streamActual = null;
var modoCamaraActual = 'environment'; // 'environment' = Trasera (inicial) | 'user' = Frontal
var eventoInstalacionDiferido = null;
var timerVerificacionAndroid = null;

// ============================================================================
// 1. REGISTRO DEL SERVICE WORKER (PWA Offline & Ámbito)
// ============================================================================
function inicializarServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(function (registro) {
        console.log('Service Worker registrado exitosamente con ámbito:', registro.scope);
      })
      .catch(function (error) {
        console.error('Error al registrar el Service Worker:', error);
      });
  } else {
    console.warn('Los Service Workers no son soportados en este navegador.');
  }
}

// ============================================================================
// 2. DETECCIÓN MULTIPLATAFORMA POR CAPACIDADES Y ENTORNO
// ============================================================================
function detectarPlataformaYCapacidades() {
  var ua = navigator.userAgent || navigator.vendor || window.opera || '';

  // Detección por capacidades y heurística de plataforma
  var esIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var esIPadOSModerno = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var esApple = esIOS || esIPadOSModerno;
  var esAndroid = /Android/.test(ua);

  // Actualizar indicador de plataforma
  if (indicadorPlataforma) {
    if (esApple) {
      indicadorPlataforma.textContent = 'iOS / WebKit';
    } else if (esAndroid) {
      indicadorPlataforma.textContent = 'Android';
    } else {
      indicadorPlataforma.textContent = 'Escritorio / Web';
    }
  }

  // Detección robusta de modo Standalone (PWA ya instalada)
  // Soporta tanto la propiedad legacy de iOS (navigator.standalone) como el estándar CSS display-mode
  var estaInstalada = (window.navigator.standalone === true) ||
                      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);

  if (indicadorEntorno) {
    if (estaInstalada) {
      indicadorEntorno.textContent = 'PWA Instalada';
      indicadorEntorno.className = 'badge badge-installed';
    } else {
      indicadorEntorno.textContent = 'Modo Navegador';
      indicadorEntorno.className = 'badge badge-browser';
    }
  }

  // Si la app YA está instalada, no mostramos ninguna guía ni banner de instalación
  if (estaInstalada) {
    if (seccionInstalacionChromium) seccionInstalacionChromium.hidden = true;
    if (instruccionesIOS) instruccionesIOS.hidden = true;
    if (instruccionesAndroid) instruccionesAndroid.hidden = true;
    return;
  }

  // Si NO está instalada, adaptar la experiencia según el sistema:
  if (esApple) {
    // En iPhone/iPad, beforeinstallprompt NO existe por diseño de WebKit. Mostramos guía manual.
    if (instruccionesIOS) instruccionesIOS.hidden = false;
    if (seccionInstalacionChromium) seccionInstalacionChromium.hidden = true;
    if (instruccionesAndroid) instruccionesAndroid.hidden = true;
  } else if (esAndroid) {
    // En Android, si en 2 segundos no se ha disparado beforeinstallprompt (ej. navegador secundario o Firefox),
    // mostramos la guía manual de tres puntos como alternativa resiliente.
    timerVerificacionAndroid = setTimeout(function () {
      if (!eventoInstalacionDiferido && instruccionesAndroid && !estaInstalada) {
        instruccionesAndroid.hidden = false;
      }
    }, 2000);
  }
}

// ============================================================================
// 3. CAPTURA DE INSTALACIÓN NATIVA (beforeinstallprompt - Android / Chromium)
// ============================================================================
window.addEventListener('beforeinstallprompt', function (evento) {
  // Prevenir que el navegador dispare el mini-infobar automático antes de tiempo
  evento.preventDefault();
  eventoInstalacionDiferido = evento;

  // Cancelar guía manual alternativa en Android si el evento nativo está disponible
  if (timerVerificacionAndroid) {
    clearTimeout(timerVerificacionAndroid);
  }
  if (instruccionesAndroid) {
    instruccionesAndroid.hidden = true;
  }

  // Mostrar el banner interactivo y botón nativo en la interfaz
  if (seccionInstalacionChromium && btnInstalar) {
    seccionInstalacionChromium.hidden = false;
    btnInstalar.hidden = false;
  }
});

if (btnInstalar) {
  btnInstalar.addEventListener('click', function () {
    if (!eventoInstalacionDiferido) {
      return;
    }

    // Invocar el diálogo nativo de instalación
    eventoInstalacionDiferido.prompt();

    // Gestionar la respuesta del usuario mediante Promesas (.then)
    eventoInstalacionDiferido.userChoice
      .then(function (eleccion) {
        if (eleccion.outcome === 'accepted') {
          actualizarMensajeEstado('¡Excelente! Aplicación instalada en pantalla de inicio.', 'exito');
          if (seccionInstalacionChromium) seccionInstalacionChromium.hidden = true;
          if (btnInstalar) btnInstalar.hidden = true;
        } else {
          actualizarMensajeEstado('Instalación postergada por el usuario.');
        }
        eventoInstalacionDiferido = null;
      })
      .catch(function (error) {
        console.error('Error durante la instalación:', error);
      });
  });
}

// Evento disparado por el sistema cuando la PWA se instala con éxito
window.addEventListener('appinstalled', function () {
  actualizarMensajeEstado('PWA instalada exitosamente en este dispositivo.', 'exito');
  if (seccionInstalacionChromium) seccionInstalacionChromium.hidden = true;
  if (instruccionesIOS) instruccionesIOS.hidden = true;
  if (instruccionesAndroid) instruccionesAndroid.hidden = true;
  if (indicadorEntorno) {
    indicadorEntorno.textContent = 'PWA Instalada';
    indicadorEntorno.className = 'badge badge-installed';
  }
});

// ============================================================================
// 4. EXPERIENCIA DE PRE-PERMISOS ÉTICA (Pre-Permission UX)
// ============================================================================
// Paso 1: Usuario pulsa "Solicitar Acceso a Cámara" -> Se muestra aviso con contexto
btnPrepararCamara.addEventListener('click', function () {
  avisoPermiso.hidden = false;
  actualizarMensajeEstado('Por favor lee la información de consentimiento antes de autorizar.');
});

// Cancelar: Usuario opta por no autorizar
btnCancelarPermiso.addEventListener('click', function () {
  avisoPermiso.hidden = true;
  actualizarMensajeEstado('Acceso a cámara cancelado voluntariamente.');
});

// Paso 2: Usuario acepta conscientemente -> Se dispara getUserMedia
btnConfirmarPermiso.addEventListener('click', function () {
  avisoPermiso.hidden = true;
  iniciarCamara(modoCamaraActual);
});

// ============================================================================
// 5. CONTROL MULTIPLATAFORMA DE CÁMARA (getUserMedia & track.stop)
// ============================================================================

/**
 * Libera rigurosamente el sensor activo y detiene todas las pistas.
 * Imprescindible en WebKit/iOS para evitar el error NotReadableError al alternar lentes,
 * y en Android para devolver el control del hardware al sistema operativo.
 */
function detenerCamaraActiva() {
  if (streamActual) {
    var tracks = streamActual.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    streamActual = null;
  }

  if (visorVideo) {
    visorVideo.srcObject = null;
  }

  // Restablecer interfaz visual
  if (placeholderCamara) placeholderCamara.hidden = false;
  if (visorContainer) visorContainer.classList.remove('camara-activa');
  if (badgeLente) badgeLente.hidden = true;
  if (grupoControlesActivos) grupoControlesActivos.hidden = true;
  if (btnPrepararCamara) btnPrepararCamara.hidden = false;
}

/**
 * Solicita acceso al sensor ('environment' o 'user') usando Promesas (.then/.catch)
 * Implementa fallback inteligente si el dispositivo no soporta facingMode estricto.
 */
function iniciarCamara(modo) {
  // 1. Detener flujo previo para evitar bloqueo de hardware
  detenerCamaraActiva();

  actualizarMensajeEstado('Solicitando acceso al sensor multimedia...');

  // Validación de API en contexto seguro (HTTPS o localhost)
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    actualizarMensajeEstado('Error crítico: getUserMedia no está disponible. Asegúrate de servir la app bajo HTTPS.', 'error');
    return;
  }

  // Restricciones estandarizadas para iOS y Android
  var restricciones = {
    video: {
      facingMode: modo
    },
    audio: false
  };

  navigator.mediaDevices.getUserMedia(restricciones)
    .then(function (stream) {
      aplicarStreamEnVisor(stream, modo);
    })
    .catch(function (error) {
      // Si el error es OverconstrainedError (común en emuladores o dispositivos con un solo sensor),
      // intentamos fallback a video genérico sin restricción de facingMode:
      if (error.name === 'OverconstrainedError') {
        console.warn('facingMode no soportado exactamente; intentando fallback genérico...');
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(function (fallbackStream) {
            aplicarStreamEnVisor(fallbackStream, modo);
          })
          .catch(function (fallbackError) {
            gestionarErrorCamara(fallbackError, modo);
          });
      } else {
        gestionarErrorCamara(error, modo);
      }
    });
}

/**
 * Conecta el flujo recibido al elemento <video> y actualiza la UI
 */
function aplicarStreamEnVisor(stream, modo) {
  streamActual = stream;
  visorVideo.srcObject = stream;

  // En Android y algunos navegadores, forzar play() garantiza el inicio del flujo
  if (visorVideo.play) {
    visorVideo.play().catch(function (err) {
      console.warn('Reproducción de video automática gestionada por el navegador:', err);
    });
  }

  // Estados visuales del visor
  placeholderCamara.hidden = true;
  visorContainer.classList.add('camara-activa');
  badgeLente.hidden = false;

  var esTrasera = (modo === 'environment');
  textoLente.textContent = esTrasera ? 'Lente Trasero' : 'Lente Frontal';

  // Efecto espejo ergonómico: la cámara frontal (selfie) debe verse como espejo
  if (esTrasera) {
    visorVideo.classList.remove('espejo');
  } else {
    visorVideo.classList.add('espejo');
  }

  // Actualizar botón para ofrecer la acción contraria
  btnAlternarCamara.textContent = esTrasera ? 'Cambiar a Frontal' : 'Cambiar a Trasera';

  // Mostrar toolbar de acciones activas
  grupoControlesActivos.hidden = false;
  btnPrepararCamara.hidden = true;

  actualizarMensajeEstado('Cámara activa (' + (esTrasera ? 'Trasera / Principal' : 'Frontal / Selfie') + '). Transmisión local.', 'exito');
}

/**
 * Diagnóstico exhaustivo de errores de hardware y permisos
 */
function gestionarErrorCamara(error, modo) {
  detenerCamaraActiva();

  var nombreError = error.name || '';
  var mensajeDetalle = error.message || '';

  console.error('Fallo de hardware en getUserMedia:', nombreError, mensajeDetalle);

  if (nombreError === 'NotAllowedError' || nombreError === 'PermissionDeniedError') {
    actualizarMensajeEstado('Permiso denegado por el usuario. Habilita la cámara en Ajustes/Configuración del navegador o sistema.', 'error');
  } else if (nombreError === 'NotFoundError' || nombreError === 'DevicesNotFoundError') {
    actualizarMensajeEstado('No se detectó el sensor solicitado (' + (modo === 'environment' ? 'trasera' : 'frontal') + ') en este equipo.', 'error');
  } else if (nombreError === 'NotReadableError' || nombreError === 'TrackStartError') {
    actualizarMensajeEstado('El sensor de cámara está ocupado o bloqueado por otra app a nivel de sistema operativo.', 'error');
  } else if (nombreError === 'OverconstrainedError') {
    actualizarMensajeEstado('Las restricciones de cámara solicitadas no son compatibles con el hardware del dispositivo.', 'error');
  } else if (nombreError === 'SecurityError') {
    actualizarMensajeEstado('Error de seguridad: getUserMedia requiere estrictamente un contexto seguro (HTTPS o localhost).', 'error');
  } else {
    actualizarMensajeEstado('Error al acceder al hardware: ' + (mensajeDetalle || nombreError), 'error');
  }
}

// Botón para alternar entre cámara Trasera y Frontal
btnAlternarCamara.addEventListener('click', function () {
  modoCamaraActual = (modoCamaraActual === 'environment') ? 'user' : 'environment';
  iniciarCamara(modoCamaraActual);
});

// Botón para apagar la cámara
btnApagarCamara.addEventListener('click', function () {
  detenerCamaraActiva();
  actualizarMensajeEstado('Cámara apagada y sensor liberado correctamente.');
});

// ============================================================================
// 6. LIBERACIÓN RIGUROSA EN CICLO DE VIDA (Evitar fugas en iOS y Android)
// ============================================================================
window.addEventListener('pagehide', function () {
  detenerCamaraActiva();
});

window.addEventListener('beforeunload', function () {
  detenerCamaraActiva();
});

document.addEventListener('visibilitychange', function () {
  // Si el usuario cambia de app o minimiza, liberamos el sensor para proteger privacidad y batería
  if (document.visibilityState === 'hidden' && streamActual) {
    detenerCamaraActiva();
    actualizarMensajeEstado('Cámara apagada automáticamente porque la aplicación pasó a segundo plano.');
  }
});

// ============================================================================
// 7. FUNCIONES AUXILIARES DE ESTADO
// ============================================================================
function actualizarMensajeEstado(texto, tipo) {
  if (!mensajeEstado) return;
  mensajeEstado.textContent = texto;
  mensajeEstado.className = 'estado-texto';

  if (tipo === 'error') {
    mensajeEstado.classList.add('error');
  } else if (tipo === 'exito') {
    mensajeEstado.classList.add('exito');
  }
}

// ============================================================================
// 8. ARRANQUE DE LA APLICACIÓN
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  inicializarServiceWorker();
  detectarPlataformaYCapacidades();
});
