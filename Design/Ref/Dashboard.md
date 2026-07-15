# Dashboard — Design Notes

Admin/analytics dashboard for sales, orders, and fulfillment-time reporting. Built on the [Tremor](https://www.tremor.so/) React component library over Tailwind, not hand-rolled SCSS like the other two apps.

Source: `Dashboard/tailwind.config.js`, `Dashboard/src/styles/App.scss`, `Dashboard/src/component/*.jsx`

## Color system

Colors come from Tremor's semantic token system (defined in `tailwind.config.js`, values pulled from Tailwind's default palette), not one-off hex constants. Always dark-mode aware via a `dark-tremor` parallel set.

| Tremor token | Light value | Dark value | Used for |
|---|---|---|---|
| `tremor-brand-DEFAULT` | `blue-500` | `blue-500` | primary accent (indigo/blue used for chart series & card decoration) |
| `tremor-brand-emphasis` | `blue-700` | `blue-400` | emphasized brand text |
| `tremor-background-DEFAULT` | `white` | `gray-900` | card surfaces |
| `tremor-background-muted` | `gray-50` | `#131A2B` | app background wash |
| `tremor-border-DEFAULT` | `gray-200` | `gray-800` | card borders/dividers |
| `tremor-content-DEFAULT` | `gray-500` | `gray-500` | body/secondary text |
| `tremor-content-strong` | `gray-900` | `gray-50` | headings/emphasized values |

Page `<body>` background is hardcoded outside the Tremor system: **`#172035`** (dark navy), in `App.scss` — this is the actual dark canvas color you see, distinct from Tremor's own `dark-tremor-background` tokens which apply inside cards.

Chart/decoration color actually used in components: **`indigo`** (see `Bar_Graph.jsx` `colors={["indigo"]}` and `Overall_Stats.jsx` `decorationColor="indigo"`) — the dashboard's de facto accent color, even though the Tailwind config formally defines "brand" as blue.

A broad safelist of every Tailwind color name (`bg-*`, `text-*`, `border-*`, `ring-*`, `stroke-*`, `fill-*` × all 22 palettes × all shades) is whitelisted for Tremor's dynamic `colors` props (e.g. per-series chart colors), so any standard Tailwind color is fair game when adding new charts — not just indigo/blue.

## Typography

No custom font is loaded (`@fontsource/inter` is a dependency but not visibly imported in `App.scss`/`main.jsx`) — text uses Tremor's default sizing scale plus Tailwind's system font stack.

| Tremor font token | Size / line-height |
|---|---|
| `tremor-label` | 12px / 16px |
| `tremor-default` | 14px / 20px — body text |
| `tremor-title` | 18px / 28px — card titles |
| `tremor-metric` | 30px / 36px — big stat numbers |

## Shape & elevation

| Token | Value |
|---|---|
| `tremor-small` radius | `0.375rem` |
| `tremor-default` radius | `0.5rem` |
| `tremor-full` radius | `9999px` (pills) |
| `tremor-card` shadow | `0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)` |
| `tremor-dropdown` shadow | `0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)` |

## Layout

- `.default`: top-level flex row — filter sidebar + main dashboard column, `20px` gap/margin.
- `.filter-plane`: fixed `320px` sidebar (`Filter_Pane.jsx`) — a Tremor `Card` with a day-picker `Select`.
- `.dashboard`: flex-1 column, `20px` gap between sections.
- `.containner` (stat row): flex row of Tremor `Card`s, fixed `110px` height, `decoration="top"` colored top border.
- `.pie-charts` / `.insights`: further flex rows/columns, same `20px` gap convention as the other two apps.

## Components (all via `@tremor/react`)

- **Stat cards** (`Overall_Stats.jsx`): `Card` with `decoration="top" decorationColor="indigo"`, label in `tremor-content` gray, big number in `tremor-metric` size + `tremor-content-strong` weight.
- **Bar/Line charts** (`Bar_Graph.jsx`, `Small_Line_Graph.jsx`, `Line_Info.jsx`): Tremor `BarChart`/`LineChart`, single-series `indigo`, custom `valueFormatter` for currency/time/date, legend hidden, tooltip on.
- **Filter pane**: Tremor `Card` + `Divider` + `Select`/`SelectItem` for date filtering, drives a shared `FilterContext`.

## Notable inconsistency to know about

Unlike Kiosk/KDS (pure SCSS, custom fonts, hand-set hex colors), Dashboard leans entirely on a third-party design system (Tremor) for both tokens and components, plus carries several unused/legacy UI deps in `package.json` (MUI, styled-components, antd, emotion) — none of these appear to be actually used in the current components. When extending the Dashboard, prefer Tremor components and its `tremor-*` Tailwind classes over introducing MUI/antd/styled-components to keep it consistent with what's actually in use.
