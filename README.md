# Inspección Visual PWA — Instalabilidad Nativa Multiplataforma (iOS & Android) y Acceso Ético a Cámara

Aplicación Web Progresiva (PWA) construida desde cero con **JavaScript Vanilla puro**, diseñada con arquitectura Mobile-First y optimizada para operar tanto en **iPhone (iOS / Safari / WebKit)** como en **Android (Google Chrome / Chromium)** y navegadores web modernos.

---

## 📋 Resumen del Proyecto y Propósito Académico

Esta práctica académica (Temas 6.1 y 6.2) implementa de forma rigurosa:
1. **Instalabilidad Nativa Multiplataforma:**
   - En **Android / Chromium**: Captura reactiva del evento `beforeinstallprompt`, guardado del evento diferido y activación mediante botón nativo dentro de la interfaz. Fallback con guía manual para navegadores sin prompt automático.
   - En **iOS / Safari**: Detección de dispositivo Apple y modo standalone (`window.navigator.standalone`). Al no existir `beforeinstallprompt` en WebKit, despliegue de guía visual interactiva con los 4 pasos de instalación manual (Compartir $\rightarrow$ Agregar a pantalla de inicio).
2. **Acceso Ético a Sensores (Pre-Permission UX):**
   - No invasión de la privacidad: `getUserMedia` jamás se ejecuta automáticamente al cargar.
   - Aviso explicativo previo que informa para qué se usará la cámara, garantiza procesamiento 100% local (sin subida a la nube) y anticipa la solicitud nativa del sistema.
3. **Control Total de Hardware y Alternancia de Lentes:**
   - Inicia por defecto en la cámara trasera (`environment`).
   - Permite alternar fluidamente a la cámara frontal (`user`) y regresar a la trasera.
   - **Liberación estricta de hardware (`track.stop()`):** Cada cambio de lente o apagado libera previamente todas las pistas multimedia para evitar bloqueos del sensor (especialmente el error `NotReadableError` crítico en iOS).
4. **Restricción Académica Estricta:**
   - Código 100% en JavaScript Vanilla.
   - **Prohibido el uso de async/await**: Toda la asincronía está resuelta mediante la API de Promesas (`.then()`, `.catch()`, `.finally()`).

---

## 📂 Estructura de Archivos del Proyecto

```text
pwa-camara-instalable/
├── index.html          # Interfaz semántica, metadatos PWA y Apple, visor con playsinline
├── styles.css          # Diseño Mobile-First adaptable a iPhone con notch y pantallas Android
├── app.js              # Lógica de cliente en Vanilla JS (Promesas puras, sin async/await)
├── sw.js               # Service Worker con estrategia Cache First para soporte offline
├── manifest.json       # Manifiesto Web con rutas relativas (./) para GitHub Pages
├── .gitignore          # Exclusión de archivos de sistema y temporales
├── README.md           # Documentación completa, matriz de pruebas y guía de defensa
└── icons/
    ├── icon-192.png    # Icono físico obligatorio de 192x192 px exactos
    └── icon-512.png    # Icono físico obligatorio de 512x512 px exactos
```

---

## 🧪 Matriz de Pruebas Multiplataforma (iOS & Android)

| Criterio de Verificación | iPhone (Safari Navegador) | iPhone (PWA Standalone) | Android (Chrome Navegador) | Android (PWA Standalone) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Visualización de Interfaz** | Adaptada a Safe Areas (notch/isla dinámica) | Sin barra de navegación Safari | Mobile-First adaptable | Pantalla completa nativa |
| **2. Proceso de Instalación** | Muestra tarjeta con guía manual (Compartir $\rightarrow$ Inicio) | Oculta guías de instalación (Detecta standalone) | Muestra botón interactivo `beforeinstallprompt` | Oculta botón de instalación (Detecta standalone) |
| **3. Icono de Aplicación** | Toma `<link rel="apple-touch-icon">` | Icono nítido de 192x192 px | Lee `icons` de `manifest.json` | Icono nítido de 192/512 px |
| **4. Pre-Permission UX** | Modal explicativo previo al diálogo nativo | Modal explicativo previo al diálogo nativo | Modal explicativo previo al diálogo nativo | Modal explicativo previo al diálogo nativo |
| **5. Acceso a Cámara (`getUserMedia`)** | Solicita permiso nativo en Safari | Solicita permiso en la PWA (aislamiento WebKit) | Solicita permiso nativo de Chrome | Conserva permiso o solicita al primer uso |
| **6. Reproducción de Video** | Dentro del marco gracias a `playsinline` | Dentro del marco gracias a `playsinline` | Fluida con `autoplay muted` | Fluida con `autoplay muted` |
| **7. Alternancia Trasera / Frontal** | Trasera por defecto; frontal con efecto espejo | Trasera por defecto; frontal con efecto espejo | Trasera por defecto; frontal con efecto espejo | Trasera por defecto; frontal con efecto espejo |
| **8. Liberación de Hardware (`track.stop`)** | Apaga sensor sin dejar luces verdes activas | Sensor liberado al alternar o cerrar app | Sensor liberado al alternar o cerrar app | Sensor liberado al alternar o cerrar app |
| **9. Diagnóstico de Errores** | Captura `NotAllowedError` si se rechaza | Captura `NotAllowedError` si se rechaza | Mensaje claro en español | Mensaje claro en español |

---

## 🚀 Despliegue en GitHub Pages y Pruebas en Vivo

### 1. Inicialización y Publicación en GitHub
En la terminal de la raíz del proyecto:

```bash
# 1. Confirmar el estado de los archivos locales
git status

# 2. Agregar todos los archivos al seguimiento
git add .

# 3. Crear el commit inicial descriptivo
git commit -m "feat: PWA multiplataforma instalable con cámara frontal/trasera, UX ética y soporte iOS/Android"

# 4. Vincular con tu nuevo repositorio remoto de GitHub
# (Crea previamente en GitHub un repositorio público llamado pwa-camara-instalable)
git remote add origin https://github.com/Aldahir9812/pwa-camara-instalable.git

# 5. Enviar a la rama main
git push -u origin main
```

### 2. Activación de GitHub Pages
1. Abre tu repositorio en GitHub $\rightarrow$ Ve a la pestaña **Settings** (Configuración).
2. En el menú lateral izquierdo, selecciona **Pages**.
3. En la sección **Build and deployment** $\rightarrow$ **Branch**:
   - Selecciona la rama `main`.
   - Selecciona la carpeta `/ (root)`.
4. Haz clic en **Save**.
5. Espera unos minutos y GitHub te dará la URL pública con HTTPS:
   `https://Aldahir9812.github.io/pwa-camara-instalable/`

---

## 📱 Cómo Probar la Aplicación en tu Dispositivo

### En tu iPhone:
1. Abre **Safari** e ingresa a tu enlace de GitHub Pages.
2. Observa la tarjeta superior con instrucciones de instalación en iOS.
3. Toca el botón **Compartir** (cuadro con flecha hacia arriba) y selecciona **"Agregar a pantalla de inicio"**.
4. Pulsa **"Agregar"** en la esquina superior derecha.
5. Cierra Safari y abre la app desde el nuevo icono en la pantalla de inicio de tu iPhone.
6. Comprueba que abre en modo **Standalone** (sin barras de Safari).
7. Toca **"Solicitar Acceso a Cámara"** $\rightarrow$ Lee el consentimiento $\rightarrow$ Pulsa **"Aceptar y Encender Cámara"**.
8. Acepta el permiso del sistema operativo.
9. Verifica que la imagen en vivo aparece dentro del marco sin saltar a pantalla completa (gracias a `playsinline`).
10. Toca **"Cambiar a Frontal"** para alternar de lente y verifica el efecto espejo.
11. Toca **"Apagar Cámara"** y comprueba que el hardware se libere inmediatamente.

### En un teléfono Android:
1. Abre **Google Chrome** e ingresa al enlace.
2. Verás el botón nativo **"Instalar App"** (gracias a `beforeinstallprompt`).
3. Pulsa el botón y confirma la instalación.
4. Abre la PWA instalada desde tu cajón de aplicaciones y realiza las pruebas de cámara y alternancia de lentes.
