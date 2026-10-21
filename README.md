# Gaincations site

Static site, no build step. Hosted on Vercel (clean URLs via vercel.json).

- `index.html`, `coaching.html`, `free.html`, `gear.html`, `programs.html` — pages. Every text node has an `.en` and `.es` span; the toggle in the nav switches them.
- `assets/site.js` — all external links and form embeds live in `LINKS` and `EMBEDS` at the top. Change a URL there once and every page updates.
- `assets/style.css` — one stylesheet, dark theme, orange accent.

Placeholders still to fill: `[PRICE]` on coaching, the guide title and bullets on free, affiliate URLs on gear, and the `EMBEDS` form URLs.
