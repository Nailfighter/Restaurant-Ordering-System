# Kitchen-Display-System — Design Notes

Back-of-house ticket board shown on a kitchen monitor. Dark theme, large type (readable from a distance), status color-coded order cards.

Source: `Kitchen-Display-System/src/styles/*.scss`

## Color palette

| Token | Hex | Used for |
|---|---|---|
| page background | `#191919` | body |
| header background | `#131313` | top header bar |
| header button/tab bg | `#1b1b1b` / `#292929` | header icon buttons, tab pill container |
| active tab pill | `#141414` | sliding indicator behind Active/History tabs |
| clock accent | `#ebab5e` (amber) | clock text; also active-tab label color |
| inactive tab text | `#e4e4e4` | |
| order body background | `#ebebeb` | ticket item list background |
| item row alt background | `#ffffff` / `#ebebeb` | zebra-striped item rows |
| "no active orders" text | `#676767` | empty-state heading |
| button gradient | `linear-gradient(180deg, #242424 0%, #101010 100%)` | order action buttons, timer pill |

### Order status gradients (`Order_Card.scss`)

| Status | Gradient |
|---|---|
| Starting (< 1 min old) | `linear-gradient(0deg, #5bddab 0%, #5edd5e 100%)` — green |
| Preparing | `linear-gradient(180deg, #ecd04a 0%, #fca53e 100%)` — yellow→orange |
| Delayed | `linear-gradient(0deg, #ef6b9f 0%, #f47171 100%)` — pink→red |
| Completed | `linear-gradient(0deg, #3e71bd 0%, #5cb0bf 100%)` — blue→teal |

An order's header color is picked in `Order_Card.jsx` (`returnHeader`): `Preparing` shows the green "Starting" gradient for the first 60 seconds since last update, then switches to the yellow "Preparing" gradient — a lightweight freshness indicator, not a distinct status.

## Typography

Fonts: `TT-Hoves` self-hosted (100–900), Google Font `Rubik` imported as fallback but not actually wired into the family stack (dead import, same pattern as Kiosk's unused Inter).

| Element | Size | Weight | Notes |
|---|---|---|---|
| `h1` | 48px | 700 | black text |
| `h2` | 48px | 400 | white — order number (`# 001`) |
| `h3` | 24px | 700 | item quantity (`2x`) |
| `h4` | 20px | 300 | item name |
| `h5` | 20px | 600 | note label |
| `h6` | 18px | 500 | white — clock time |
| header tabs | 36px | 700 | Active / History |
| timer pill | 24px | 800 | white |

## Layout

- `.active-orders`: CSS grid, `repeat(auto-fill, minmax(300px, 1fr))`, `30px` gap, `50px` outer margin, items centered — a responsive card wall that reflows to however many columns fit.
- Header is a fixed-height (`78px`) 3-zone flex bar: icon buttons (left) / sliding pill tabs (center) / live clock (right). Buttons and clock hide below `1080px`; padding shrinks below `768px`.
- Order card: header (colored by status) + body (light `#ebebeb`), header bottom overlaps body by `26px` so the floating pill-shaped timer (`position: absolute; bottom: -26px`) straddles the seam.

## Components

- **Order card** (`Order_Card.scss`): `15px` radius, colored gradient header containing order number, created time (dark translucent pill), optional note, and a floating timer pill anchored to the header/body seam. Body is a light zebra-striped item list (`2x  Item Name`).
- **Card_Buttons**: full-width flex row of equal-flex action buttons (e.g. advance/complete), dark gradient fill, `10px` radius, icon + label.
- **Tabs (Active/History)**: pill-shaped tab group with a sliding dark background rectangle (`.header-tabs-rec`) animated via `margin-left` transition (`0.2s ease`) rather than a transform — swaps between `0%` and `50%`.
- **Header clock**: live-updating 12-hour clock, updates every second via `setInterval`, amber accent color.
- **Empty state**: centered, oversized (`54px`), light-weight (200) gray heading — deliberately muted vs. the rest of the high-contrast UI.
- **Auto-complete logic**: cards silently self-complete (PUT to API) and render nothing if every item on the order is in a hardcoded "not going back" id list (12–15) — a display quirk to be aware of if a card unexpectedly vanishes.

## Motion

Lighter use of `framer-motion` than the other two apps — mainly available as a dependency; most interactivity here (tab slide, timers) is done with plain CSS transitions/intervals instead.
