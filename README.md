# Grupo Metcon — Sitio Web v2

Sitio estático HTML/CSS/JS. Sin frameworks, sin dependencias de npm. Rápido, liviano, deployable en Vercel en segundos.

## Estructura

```
grupometcon-site/
├── index.html          # Home
├── nosotros.html       # Quiénes somos
├── rubros.html         # 3 rubros con detalle
├── proyectos.html      # Galería de obras
├── contacto.html       # Formulario + datos
├── css/
│   └── styles.css      # Todo el CSS (variables, componentes, responsive)
├── js/
│   └── main.js         # Nav, scroll, fade-in, counters
├── assets/
│   └── img/
│       ├── obras/      # Fotos de obra (reemplazar por Cloudinary)
│       └── logo-blanco.png
└── scripts/
    └── upload-to-cloudinary.mjs   # Script de migración de imágenes
```

## Deploy en Vercel

```bash
# 1. Clonar / inicializar repo
git clone https://github.com/TU_USUARIO/grupometcon-site.git
cd grupometcon-site

# 2. Instalar Vercel CLI (si no lo tenés)
npm i -g vercel

# 3. Deploy
vercel
# → Seguir el wizard: link a tu cuenta, proyecto nuevo, sin configuración adicional
# → Vercel detecta HTML estático automáticamente

# 4. Para producción
vercel --prod
```

## Conectar al repo de GitHub existente

```bash
# Dentro del repo local que ya tenés:
git remote set-url origin https://github.com/TU_USUARIO/grupometcon-site.git

# Reemplazar TODO el contenido con este v2:
git add -A
git commit -m "feat: rediseño completo v2 — dark editorial premium"
git push origin main --force
```

> ⚠️  `--force` porque reescribe el historial. Hacelo solo si el repo no tiene colaboradores.

## Migrar imágenes a Cloudinary

Las fotos de obra están en `assets/img/obras/` (locales ahora). Para subirlas a tu Cloudinary:

```bash
# Setear credenciales (las mismas de tu sitio personal)
export CLOUDINARY_CLOUD_NAME=dksm2ttkj
export CLOUDINARY_API_KEY=tu_api_key
export CLOUDINARY_API_SECRET=tu_api_secret

node scripts/upload-to-cloudinary.mjs
```

El script sube todo a `grupometcon/obras/nombre-imagen` y te imprime la tabla de reemplazos. Después buscás y reemplazás en los HTML:

```
assets/img/obras/topografia.jpg
→ https://res.cloudinary.com/dksm2ttkj/image/upload/grupometcon/obras/topografia.jpg
```

Una vez migradas, podés eliminar `assets/img/obras/` del repo (las imágenes de logo son livianas, dejalas locales).

## Reemplazar imágenes con las tuyas

Cada `<img>` en los HTML tiene `alt` descriptivo y un nombre de archivo claro. Para reemplazar:

1. Subí tu foto a Cloudinary en `grupometcon/obras/nombre`
2. Cambiá la URL del `src` en el HTML correspondiente
3. Commit + push → Vercel redeploya en ~30 segundos

## Paleta y tipografía

```css
/* Colores */
--accent:  #C4782A;    /* Amber/copper — botones, labels, hover */
--bg:      #0A0A0A;    /* Fondo principal */
--ink:     #F0EDE8;    /* Texto principal */

/* Tipografía */
--serif:   'DM Serif Display';   /* Títulos */
--sans:    'DM Sans';            /* Cuerpo / nav */
--mono:    'IBM Plex Mono';      /* Labels / metadata */
```

---

© 2026 Grupo Metcon
