# Voice-to-Phone — Sitio (Astro)

Resumen rápido

- Sitio estático construido con **Astro v5**. Contenido gestionado como Markdown en `src/content/{english,spanish,chinese}`.
- Este repo incluye un scraper (Puppeteer) que genera páginas de ayuda en `src/content/help/<lang>/` y sus imágenes en `public/images/help/`.

Requisitos

- Node.js (ver `package.json` -> `engines`) — usar una versión compatible (ej. >=18.20.8 o >=20.3.0).
- npm (>=9.x)

Instalación

```powershell
npm ci
```

Modo desarrollo (Windows — paso a paso)

> Nota: en Windows no uses el `npm run dev` combinado en una sola ventana (el `&` no funciona bien en shells). Abre **dos** terminales.

1. En la primera terminal (se queda en ejecución):

```powershell
npm run toml:watch
# o directamente
# node scripts/toml-watcher.mjs
```

Esto mantiene sincronizados los archivos `.toml` del directorio `src/config` durante el desarrollo.

2. En la segunda terminal (para levantar Astro):

```powershell
npx astro dev
```

Ahora el sitio estará disponible normalmente en `http://localhost:4321`.

Compilación y previsualización

```bash
npm run build
npm run preview
```

Generar / actualizar contenido de ayuda (scraper)

- El scraper usa Puppeteer para renderizar las páginas remotas y escribir Markdown en `src/content/help/<lang>/` y descargar imágenes en `public/images/help/`.
- Para regenerar el contenido de ayuda:

```bash
node scripts/scrape-help.mjs
```

- Después de ejecutar el scraper, commit los archivos relevantes: `src/content/help/**` y `public/images/help/**`.
- Excluir archivos de debugging: `scripts/debug-*.html`.

Pruebas y formateo

```bash
npm test       # jest (en watch mode por defecto)
npm run format # prettier (aplica formateo en src/)
```

Scripts útiles (resumen)

- `npm run dev` — (no recomendado en una sola terminal en Windows; ver la sección arriba)
- `npm run build` — build de producción
- `npm run preview` — previsualizar build
- `npm run toml:watch` — watcher de toml (necesario en dev)
- `node scripts/scrape-help.mjs` — ejecutar scraper Puppeteer
- `npm run generate-favicons` — generar favicons
- `npm run remove-draft-from-sitemap` — limpiar sitemap después del build

Estructura relevante

- `src/content.config.ts` — esquema de colecciones (mirar `help` para la estructura de ayuda)
- `src/config/language.json` — configuración de idiomas / carpetas (contentDir)
- `src/pages/...` — templates de página, incluyendo las plantillas para `/help` e individual sections/questions
- `scripts/scrape-help.mjs` — scraper principal
- `src/styles/components.css` — estilos compartidos para cards/details del área de ayuda

Convenciones y comportamientos a tener en cuenta

- Rutas: las páginas generadas por el scraper incluyen `route` en el frontmatter. El sitio usa `trailingSlash` configurado en `astro.config.mjs`; si está en `always`, asegúrate de que `route` y enlaces terminen en `/` para evitar 404.
- Multilenguaje: content organizado por carpetas `english|spanish|chinese` y las plantillas usan helpers `getCollectionCTM` / `getEntryCTM` (`src/lib/contentParser.astro`).
- Commit de contenido generado: cuando ejecutes el scraper, añade y commitea los archivos en `src/content/help/*` y `public/images/help/*` con un mensaje claro, p.ej. `chore(help): regenerate help content`.

Depuración común

- 404 en rutas de ayuda: verificar `route` en el frontmatter (`/help/<slug>/es/`) y que exista la plantilla correspondiente (`src/pages/help/[slug]/index.astro` o `src/pages/[...lang]/help/[slug].astro`).
- Si algo no aparece en build, revisar `src/content.config.ts` para la colección correspondiente y si `draft: true` está presente (las páginas `draft:true` se excluyen en producción).

Contribuir

- Ejecuta `npm run format` antes de commitear.
- Mantén mensajes de commit concisos y descriptivos (p.ej. `chore(help): regenerate help content`).
- No incluyas archivos debug (`scripts/debug-*.html`) en commits.

Preguntas frecuentes para desarrolladores

- ¿Dónde están las páginas de ayuda? — `src/content/help/<lang>/<section>.md` y por pregunta `src/content/help/<lang>/<section>/<question>.md`.
- ¿Cómo reproduzco el problema de rutas sin slash? — Revisa `astro.config.mjs` (valor `trailingSlash`) y el `route` en los frontmatter.

Si quieres, puedo:

- Añadir tests que verifiquen que cada sección tiene al menos una pregunta `.md`,
- Añadir instrucciones de CI para ejecutar el scraper de forma segura (por ejemplo, usando Playwright/Puppeteer en modo headless con timeouts), o
- Crear un `AGENT.md` con una lista de tareas para futuros agentes.

---

Pequeño recordatorio: si quieres que haga un commit de este `README.md` (y/o un `AGENT.md`), dime y lo preparo y subo al remoto.
