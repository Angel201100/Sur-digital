# Sur Digital – React + Vite + React Router DOM

## Estructura del proyecto

```text
src/
├── assets/images/   Imágenes del carrusel
├── components/      Componentes compartidos (encabezado, pie y carrusel)
├── data/            Datos de las diapositivas
├── pages/           Vistas asociadas a las rutas
├── App.jsx          Rutas y estructura general
├── index.css        Estilos globales y de las vistas
└── main.jsx         Punto de entrada de React
```

## Cómo ejecutarlo
```bash
npm install
npm run dev
```
Abre la dirección que muestra la terminal (normalmente http://localhost:5173).

## Rutas
- `/` Inicio (carrusel de 10 imágenes)
- `/nosotros` ¿Quiénes somos?
- `/contacto` Contacto

## Personalizar
- Imágenes: reemplaza `src/assets/images/imagen1.jpg` … `imagen10.jpg` (mismo nombre).
- Títulos y descripciones del carrusel: `src/data/slides.js`.
- Textos de la empresa: `src/pages/Nosotros.jsx`, `src/pages/Contacto.jsx` y `src/components/Footer.jsx`.
