# 🏙️ Pilar Turismo

Aplicación móvil de turismo para el **Partido de Pilar**, Buenos Aires, Argentina. Desarrollada con React Native y Expo, permite a los turistas explorar los lugares de interés, el mapa, el clima y gestionar su perfil personal.

---

## 📸 Pantallas

| Inicio | Mapa | Clima | Perfil |
|--------|------|-------|--------|
| Lugares destacados de Pilar con fotos e información | Exploración interactiva del mapa | Pronóstico y alertas meteorológicas | Perfil del turista con ajustes de idioma |

---

## 🚀 Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| [Expo](https://expo.dev) | ~57.0.22 | Framework principal |
| [React Native](https://reactnative.dev) | 0.86.3 | UI nativa |
| [expo-router](https://expo.github.io/router) | ~57.0.21 | Navegación por rutas de archivos |
| [Firebase](https://firebase.google.com) | ^12.18.0 | Base de datos (Firestore) |
| [i18next](https://www.i18next.com) + [react-i18next](https://react.i18next.com) | ^26 / ^17 | Internacionalización (ES / EN) |
| [expo-localization](https://docs.expo.dev/versions/latest/sdk/localization/) | ~57.0.2 | Detección de idioma del dispositivo |
| [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | ~57.0.17 | Cambio de foto de perfil |
| [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | ~57.0.3 | Feedback táctil en pestañas |
| TypeScript | ~6.0.3 | Tipado estático |

---

## 📁 Estructura del Proyecto

```
pilar-turismo/
├── assets/
│   ├── iconos_barra/       # Íconos PNG de la barra de navegación
│   │   ├── home.png
│   │   ├── map-pin.png
│   │   ├── clima.png
│   │   └── user.png
│   └── images/             # Imágenes de lugares y splash screen
│       └── lugaresIniciales/
├── src/
│   ├── app/                # Pantallas (expo-router file-based routing)
│   │   ├── _layout.tsx     # Layout raíz con AppTabs e i18n
│   │   ├── index.tsx       # Pantalla de Inicio (lugares destacados)
│   │   ├── explore.tsx     # Pantalla de Mapa
│   │   ├── clima.tsx       # Pantalla de Clima
│   │   └── perfil.tsx      # Pantalla de Perfil (idioma, foto, sesión)
│   ├── components/
│   │   ├── app-tabs.tsx    # Barra de navegación unificada (Tabs + iconos + i18n)
│   │   ├── haptic-tab.tsx  # Botón de pestaña con feedback háptico
│   │   ├── themed-view.tsx # View con soporte de tema claro/oscuro
│   │   ├── themed-text.tsx # Text con soporte de tema claro/oscuro
│   │   ├── icon-symbol.tsx # Íconos de SF Symbols / Material Icons
│   │   └── ...
│   ├── configuracion/
│   │   └── FirebaseConfig.ts  # Configuración e inicialización de Firebase
│   ├── constants/
│   │   └── theme.ts           # Paleta de colores del tema
│   ├── data/
│   │   └── lugaresIniciales.tsx  # Componente que carga y muestra lugares de Firestore
│   ├── hooks/
│   │   ├── use-color-scheme.ts    # Hook para detectar modo claro/oscuro
│   │   └── use-theme-color.ts     # Hook para obtener colores según el tema
│   └── i18n/
│       ├── index.ts           # Inicialización de i18next
│       └── locales/
│           ├── es.json        # Traducciones en español
│           └── en.json        # Traducciones en inglés
├── app.json                   # Configuración de la app (Expo)
├── package.json
└── tsconfig.json
```

---

## ⚙️ Configuración y Puesta en Marcha

### Requisitos previos

- [Node.js](https://nodejs.org) >= 18
- [npm](https://www.npmjs.com) >= 9
- [Expo Go](https://expo.dev/go) instalado en tu celular (para pruebas físicas)

### Instalación

```bash
git clone https://github.com/candelariarg/pilar-turismo.git
cd pilar-turismo
npm install
```

### Iniciar la aplicación

```bash
npx expo start
```

Luego podés:
- Escanear el QR con **Expo Go** (Android/iOS)
- Presionar `a` para Android Emulator
- Presionar `i` para iOS Simulator
- Presionar `w` para abrir en el navegador (Web)

---

## 🌍 Internacionalización (i18n)

La app detecta automáticamente el idioma del dispositivo al iniciarse:
- 🇦🇷 **Español** por defecto
- 🇺🇸 **Inglés** disponible

El usuario puede cambiar el idioma manualmente desde la **pantalla de Perfil**. El cambio se refleja en tiempo real en todos los textos de la app, incluyendo los títulos de la barra de navegación.

Los archivos de traducciones se encuentran en:
- [`src/i18n/locales/es.json`](src/i18n/locales/es.json)
- [`src/i18n/locales/en.json`](src/i18n/locales/en.json)

---

## 🔥 Firebase

La app usa **Firebase Firestore** para obtener los lugares turísticos.

- **Colección**: `lugares iniciales`
- **Campos**: `Nombre`, `Dirección`, `Descripción`, `imagen_uri`

La configuración de Firebase se encuentra en [`src/configuracion/FirebaseConfig.ts`](src/configuracion/FirebaseConfig.ts).

> ⚠️ En un entorno de producción, se recomienda mover las claves de Firebase a variables de entorno.

---

## 🎨 Diseño

- **Color institucional**: `#2196F3` (azul Pilar)
- **Barra de navegación**: Fondo azul con íconos y etiquetas en blanco
- **Tema adaptable**: Soporte para modo claro y oscuro (modo automático según el dispositivo)
- **Íconos personalizados**: PNGs propios para Inicio, Mapa, Clima y Perfil
- **Feedback háptico**: Respuesta táctil al tocar las pestañas (iOS)

---

## 🗂️ Ramas del Repositorio

| Rama | Descripción |
|---|---|
| `main` | Versión estable con `AppTabs` nativo y estructura base |
| `pantalla_de_perfil` | Versión con pantalla de perfil completa, internacionalización, foto de usuario y cambio de idioma |

---

## 📜 Scripts Disponibles

```bash
npm start          # Iniciar servidor de desarrollo de Expo
npm run android    # Abrir en Android
npm run ios        # Abrir en iOS
npm run web        # Abrir en el navegador
npm run lint       # Revisar el código con ESLint
```

---

## 👥 Equipo de Desarrollo

Proyecto universitario desarrollado por el equipo de Pilar Turismo.
