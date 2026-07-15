# Design Reference

Notes on the visual language of the three frontends in this repo, reverse-engineered from their SCSS/Tailwind source. Use these as the source of truth when building new screens or components so new work matches the existing look.

| App | Purpose | Styling approach | Vibe |
|---|---|---|---|
| [Order-Kiosk](./Order-Kiosk.md) | Customer-facing self-order kiosk | SCSS (BEM-ish), custom fonts, gradients | Warm, food-forward, rounded, orange/peach |
| [Kitchen-Display-System](./Kitchen-Display-System.md) | Kitchen ticket/order board | SCSS, custom fonts | Dark, high-contrast, status-color-coded |
| [Dashboard](./Dashboard.md) | Admin analytics dashboard | Tailwind + Tremor component library | Dark navy, data-dense, blue accent |

## Shared conventions across all three apps

- **Stack**: Vite + React 18, no CSS-in-JS except Dashboard (which also carries MUI/styled-components as unused/legacy deps).
- **Animation**: `framer-motion` is used in all three for overlays, buttons, and list transitions (spring-based bounce-in, fade/slide-out).
- **Border radius**: consistently rounded — `10px`–`25px` on cards/panels, fully pill-shaped (`9999px`/`120px`) on buttons and tags.
- **Headings as semantic scale**: all three apps repurpose `h1`–`h6` globally in their base SCSS as a fixed type scale rather than styling per-component — check the app's `App.scss` before adding new heading levels.
- **Custom fonts loaded locally**: `TT-Hoves` and `TT-Interfaces` (variable weights 100–900) are self-hosted under each app's `public/Fonts/`, declared in a `Custom_Fonts.scss` partial, with Google Fonts (`Rubik` for KDS, `Inter` for Kiosk) as a secondary import that mostly goes unused in favor of the TT families.
- **Icons**: flat PNG icon assets under `public/Icon/` (not an icon font/SVG library), referenced directly via `<img src="Icon/x.png">`.

## Source-of-truth files

If these docs and the code ever disagree, trust the code:
- `Order-Kiosk/src/styles/scss/App.scss` — color/gradient/font variables
- `Kitchen-Display-System/src/styles/App.scss` + `Order_Card.scss` — status colors, dark theme
- `Dashboard/tailwind.config.js` — Tremor color/shadow/radius tokens
