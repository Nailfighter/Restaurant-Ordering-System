# Order-Kiosk — Design Notes

Customer-facing touchscreen ordering UI. Warm/food-themed, big touch targets, animated overlays.

Source: `Order-Kiosk/src/styles/scss/*.scss`

## Color palette

| Token | Hex | Used for |
|---|---|---|
| `$primary-color` | `#faaf79` | card outlines, tags, price badge, buttons |
| `$secondary-color` | `#fb944a` | quantity "more" button |
| `$background-grad` | `linear-gradient(45deg, #ffe7c9, #fef0de)` | page background |
| `$order-primary-color` | `#282a33` | cart panel background, body text color |
| `$order-background-grad` | `linear-gradient(0deg, #31343f 0%, #282a33 40%)` | cart panel background |
| `$quantity-grad` | `linear-gradient(0deg, #f98e47 0%, #faaf79 100%)` | quantity number text (gradient text-clip), confirm button |
| cart item bg | `#25262b` | individual line items in cart |
| note/input bg | `#363944` | note box, quantity pill background |
| danger | `#ff4141` | close button on order-lookup overlay |

### Allergen/dietary tag colors (`Tag.scss` / `Food_Card.scss`)

| Tag | Hex |
|---|---|
| Nuts | `#b07969` |
| Gluten | `#ffc0b0` |
| Vegan | `#c9f79a` |
| Diary (Dairy) | `#b1ebfa` |
| Egg | `#ffdc7d` |
| Cold | `#b1c4fa` |

All tags share one mixin: pill shape (`border-radius: 25px`), white bold 12px text, `padding: 6px 14px`.

## Typography

Fonts: `TT-Hoves` (body/primary) and `TT-Interfaces` (numerals/prices/ticket), self-hosted, weights 100–900. Google Fonts `Inter` is imported but not actually referenced in the family stacks — treat it as unused.

| Element | Size | Weight | Notes |
|---|---|---|---|
| `h1` | 54px | 800 | white, letter-spacing 2px |
| `h2` | 64px | 800 | TT-Interfaces, dark, letter-spacing 3px — used for prices |
| `h3` | 34px | 700 | white, letter-spacing 2px |
| `h4` | 26px | 500 | inline, food item name |
| `h5` | 48px | 800 | gradient text-fill (`$quantity-grad`) — quantity counter |
| `h6` | 30px | 700 | |
| body | 16px | 400 | |

## Layout

- Two-column layout: `.main` (flex: 7, menu/food grid) + `.space`/`.order` (flex: 2.625, fixed-position cart panel, `484px` wide).
- Cart (`.order`) is `position: fixed; right: 0`, dark gradient, `25px` corner radius, floats independent of scroll.
- Food grid: responsive card width via breakpoints — 22% (>1626px), 30% (1280–1626px), 45% (965–1280px), 100% (<965px). Gap `40px`.
- Base spacing unit `$content-gap: 20px` reused for section gaps.
- Animated wavy background image (`Image/Wave.png`) with a slow 10s `moveBackground` keyframe loop.

## Components

- **Food_Card** (`Food_Card.scss`): white card, `15px` radius, `6px solid` outline in primary color, hover = orange glow (`box-shadow 0 0 15px 5px rgba(249,142,71,0.6)`). Image `192px` tall, `object-fit: cover`. Price shown in a peach badge with an asymmetric corner (`border-top-right-radius: 45px`, `border-bottom-left-radius: 10px`).
- **Tabs**: pill buttons, `25px` radius, unselected = white, selected = `#f9964f` with white text, drop shadow `0 4px 12px rgba(0,0,0,0.25)`.
- **Cart item row**: dark rounded row (`#25262b`, `10px` radius) with quantity stepper.
- **Quantity_Selector**: pill-shaped stepper (`120px` radius), small round "-" button (`#363944`) and larger round "+" button (`#fb944a`), gradient counter text.
- **Order confirm/cancel buttons**: confirm = flex-1 gradient button; cancel = small square icon-only button (`#232429`).
- **Order lookup overlay** (`Header.jsx`): full-screen dark scrim (`rgba(0,0,0,0.8)`) with a ticket-shaped image background (`Icon/Ticket.png`), framer-motion spring bounce-in.
- **Search box**: white pill input, `15px` radius, soft shadow, icon + placeholder text.

## Motion

`framer-motion` drives: search box slide-in, search icon scale, order-lookup overlay fade + spring "bounce" card, order line items staggered fade/slide, button hover/tap scale (hover 1.1, tap 0.9).
