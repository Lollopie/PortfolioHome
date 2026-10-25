# florian-piel.space

Portfolio home page and gateway to the apps hosted on the domain, deployed to Render as a static site (`render.yaml`).

- `src/template.html` is the page; `i18n/en.json` and `i18n/de.json` hold its text.
- `node build.mjs` writes `public/index.html` (English) and `public/de/index.html` (German). Render runs it on deploy; run it locally before opening `public/` in a browser. It fails if the two language files don't have the same keys.
- The "Download CV" buttons appear once `public/cv/cv-en-public.pdf` and `public/cv/cv-de-public.pdf` exist.
