# Dashboard Service — Frontend Report

## 1. Overview

The **Dashboard** app is the analytics/management frontend of the Restaurant-Ordering-System. It presents sales, order, and item-level analytics for the restaurant, gated behind a Supabase-authenticated operator login with per-service access approval (the same "operator approval" model used by the Kiosk and Kitchen apps).

**Tech stack** (from `Dashboard/package.json`):

| Layer | Technology |
|---|---|
| Framework | React 18.3 (JSX), Vite 5 build tool |
| Routing | `react-router-dom` v7 (`/login`, `/app`, catch-all redirect) |
| Charts / UI kit | **Tremor React** (`@tremor/react` 3.17) — `BarChart`, `AreaChart`, `DonutChart`, `BarList`, `Card`, `Select`, `LineChart` |
| Styling | Tailwind CSS 3.4 (with Tremor theme extension, `@tailwindcss/forms`, `@headlessui/tailwindcss`) **plus** hand-written SCSS (`sass`) |
| Animation | `framer-motion` 11 (auth ticket, sign-out FAB) |
| Auth / backend | `@supabase/supabase-js` (session + `operator_profiles` table); dashboard data via a REST API at `VITE_API_URL` (`/api/dashboard/...` endpoints) |
| Also installed | MUI 5, `@mui/x-date-pickers`, Ant Design 5, styled-components, `@headlessui/react`, `dayjs`, `@remixicon/react` — largely unused in current source |

Source lives in `Dashboard/src`: `App.jsx`, `AuthContext.jsx`, `Fetch_Data.jsx`, `FilterContext.jsx`, `Food_List.jsx`, `supabaseClient.js`, `main.jsx`, twelve components in `component/`, and three SCSS files in `styles/`.

## 2. Features

### Analytics

| Feature | File |
|---|---|
| **Overall stat cards** — "Total Sales Revenue" and "Total Number of Orders" as Tremor `Card`s with an indigo top decoration; switches between all-time and per-day totals based on the filter | `src/component/Overall_Stats.jsx` |
| **Sales/Orders per hour area charts** — two `AreaChart`s (purple = revenue/hour, indigo = orders/hour) shown only when a specific day is selected; data bucketed 8 AM–10 PM in `getOrdersByHour` | `src/component/Line_Info.jsx` + `src/Fetch_Data.jsx` |
| **Sales by item donut chart** — Tremor `DonutChart` plus a legend `List` with per-item dollar amount and percentage-share pill; colors cycled from a shared palette | `src/component/Item_Sale.jsx` (palette from `src/Food_List.jsx`) |
| **Items bought bar list** — Tremor `BarList` (indigo) of quantities per item, all-time or per-day | `src/component/Item_Numbers.jsx` |
| **Insights KPI cards** — "Average Revenue per Order" (ARO) and "Average Order Size" (AOS) from `/api/dashboard/stat/aro|aos`; only rendered when filter is "All" | `src/component/Insights.jsx` |
| **Bar graph over time** — sales/orders/avg-fulfillment-time per day `BarChart` for the last 3 event days | `src/component/Bar_Graph.jsx` — **currently commented out** in `Overall_Stats.jsx` |
| **Small sparkline area chart** — hourly revenue/orders mini `AreaChart` with gradient; uses hardcoded sample data | `src/component/Small_Line_Graph.jsx` — imported but not rendered |

### Filtering

| Feature | File |
|---|---|
| **Day filter** — Tremor `Select` with "All Days" plus three hardcoded event dates (Aug 6/7/8, 2025), mapped to numeric day indexes | `src/component/Filter_Pane.jsx` — **commented out** in `App.jsx`, so the filter UI is currently unreachable |
| **Filter state context** — `selectedDate` (default `"All"`) shared to every chart | `src/FilterContext.jsx` |

### Data layer

| Feature | File |
|---|---|
| REST fetchers for dates, totals, per-day sales/orders, per-item sales/quantities, ARO/AOS insights, and per-hour order bucketing (with string→int JSON normalization) | `src/Fetch_Data.jsx` |
| Stubbed metrics: `getAvgOrderTime()` returns `5.5` and `getAvgOrderTimeByDay()` returns `2` — hardcoded placeholders | `src/Fetch_Data.jsx` |
| Menu list with prices/allergen tags + `colors` palette + dummy-data generator (random amounts/quantities) | `src/Food_List.jsx` |

### Auth & access control

| Feature | File |
|---|---|
| Supabase session management, `operator_profiles` fetch, `signIn`/`signUp`/`signOut`, admin role and per-service access flags (`access_kiosk`/`access_dashboard`/`access_kitchen`) | `src/AuthContext.jsx`, `src/supabaseClient.js` |
| Route gating: `/login` → ticket login; `/app` → dashboard if `access.dashboard`, else "approval pending"; `*` → redirect | `src/App.jsx` |
| **Ticket-style login/register** — animated receipt "prints out" (clip-path reveal), sign-in/register tab pill, name/email/password fields, shake-in error message, decorative barcode | `src/component/Auth_Ticket.jsx` + `src/styles/Auth_Ticket.scss` |
| **Approval-pending screen** — same ticket skin; shows operator name, "Check Access" re-fetch button, sign-out link | `src/component/Approval_Pending.jsx` |
| Service constants + floating **Sign Out FAB** (bottom-right, logout icon) | `src/component/AuthGate.jsx` |
| Legacy Tremor login form — static, non-functional (`action="#"`), commented out in `App.jsx` | `src/component/Credentials.jsx` |

## 3. UI / Frontend Look

### Color palette

- **App canvas**: dark navy `#172035` set on `body` in `src/styles/App.scss`.
- **Tremor theme** (`tailwind.config.js`): brand = Tailwind **blue** (`blue-500` default, `blue-700` emphasis); light-mode surfaces are `white`/`gray-50`/`gray-100` with `gray-200` borders; dark-mode surfaces are `gray-900` on custom navys `#0B1229` (brand faint) and `#131A2B` (background muted), `gray-800` borders.
- **Chart colors**: `indigo` for bar charts/bar lists and orders-per-hour, `purple` for revenue-per-hour area charts; the donut cycles through 13 Tailwind 500-shades defined in `src/Food_List.jsx` (`cyan-500`, `blue-500`, `indigo-500`, `violet-500`, `fuchsia-500`, `teal-500`, `green-500`, `yellow-500`, `orange-500`, `lime-500`, `emerald-500`, `sky-500`, `rose-500`).
- **Auth ticket skin** (`Auth_Ticket.scss` variables): `$brand: #3b82f6` (blue-500), `$brand-deep: #1d4ed8` (blue-700) in a vertical gradient stub; `$paper: #111827` (gray-900), `$panel: #1f2937`, `$border: #374151`, `$ink: #f9fafb`, `$muted: #6b7280`; error red `#f87171`; link/accent `#60a5fa`. Background is the navy canvas overlaid with faint 44px chart-gridline `repeating-linear-gradient`s and two indigo/blue radial glows (`rgba(99,102,241,0.18)`, `rgba(59,130,246,0.12)`).

### Typography

- `index.html` loads **Inter** (variable, 100–900) and **Rubik** from Google Fonts.
- `src/styles/Custom_Fonts.scss` declares full `@font-face` families for **TT Hoves** and **TT Interfaces** (weights 100–900 from local `.otf` files) — but this file is **never imported** by any component, so those fonts are dead weight in this app.
- The ticket screens use `$font-stack: "Inter", -apple-system, "Segoe UI", Roboto, sans-serif`. The dashboard body inherits Tremor/Tailwind defaults (no `font-family` set on `body`), so Inter is loaded but not actually applied globally.
- Tremor type scale from config: labels 0.75rem, default 0.875rem, titles 1.125rem, metric numbers 1.875rem semibold.

### Layout

- `App.scss` builds the page with flexbox: `.default` (20px margins/gap) wraps `.dashboard` (column, 20px gap); `.containner` [sic] holds two 110px-tall stat cards side by side; `.pie-charts` puts the donut card next to a stacked `.insights` column (bar list + insight cards). All fixed `flex` rows — no responsive breakpoints or grid.
- Cards are Tremor cards: `0.5rem` radius, subtle `0 1px 3px` shadows, 1px borders. Stat cards use `decoration="top" decorationColor="indigo"` (a colored top edge).
- The login/pending screens are full-viewport (`position: fixed; inset: 0`) with a centered 420px "receipt" card: gradient stub header with uppercase letter-spaced eyebrow, dashed perforation line, dashed-underline input fields, decorative CSS barcode, and a zig-zag torn bottom edge (`.ticket-tear` built from 14px angled gradients). A floating sign-out pill sits at bottom-right, glowing blue on hover.

### Overall aesthetic

Dark, chart-forward "analytics console" look: navy canvas, gray-900 cards, blue/indigo accents, big semibold metric numbers, animated Tremor charts (3s ease-in animations, natural/linear curves, gradient area fills). The auth flow adds a playful skeuomorphic "staff ticket" motif with framer-motion print-out and tab-pill animations. However, the dashboard content itself renders Tremor's **light** theme classes on the dark navy body (there is no `dark` class toggle), so white cards sit on a dark background.

## 4. 10 Improvements

1. **Add loading, error, and empty states to all data fetches.** Every chart (`Overall_Stats.jsx`, `Item_Sale.jsx`, `Item_Numbers.jsx`, `Insights.jsx`, `Line_Info.jsx`) starts with `useState([])` and swaps in data whenever the fetch resolves; failures are only `console.error`'d (or, in `Overall_Stats.jsx` and `Insights.jsx`, not caught at all — `fetchJson` in `Fetch_Data.jsx` never checks `response.ok`). The user sees blank cards indefinitely if the API is down. Add skeleton loaders on the cards, an inline error banner with a retry button, and a "No data for this day" empty state.

2. **Restore the day filter — it's the app's core UX and it's commented out.** `App.jsx` has `{/* <FilterPane /> */}`, so `selectedDate` is permanently `"All"`, making the per-hour charts, per-day queries, and the `Insights` hide-logic unreachable. Re-mount `FilterPane` (e.g., as a top toolbar), and replace the three hardcoded `SelectItem` dates ("Aug 6, 2025" … in `Filter_Pane.jsx`) with dates fetched from `getDateFromServer`/a `/api/dashboard/dates` endpoint so the UI doesn't go stale after each event.

3. **Commit to one theme — currently light Tremor cards float on a hardcoded dark body.** `App.scss` sets `body { background-color: #172035 }` while every component uses light-mode classes (`text-tremor-content-strong`, white `Card`s) with `dark:` variants that never activate because no `dark` class is applied to `<html>`. Either add `class="dark"` (Tailwind `darkMode: 'class'`) so the configured `dark-tremor` palette (`#131A2B`, gray-900 surfaces) actually renders and matches the ticket screens, or drop the navy body. Right now the design system disagrees with itself.

4. **Make the dashboard responsive.** `App.scss` uses fixed flex rows (`.containner`, `.pie-charts`, and the `flex gap-5` per-hour pair in `Overall_Stats.jsx`) with no media queries, and `Bar_Graph.jsx`/`Line_Info.jsx` charts use `hidden … sm:block` — meaning on phones charts simply disappear while their card headers remain. Convert the layout to Tailwind grid (`grid-cols-1 lg:grid-cols-2`), let cards stack below `lg`, and render smaller charts on mobile instead of hiding them.

5. **Fix serial data fetching and stale-response races.** `Bar_Graph.jsx` awaits `getDateFromServer`, `getSalesByDay`, `getOrdersByDay`, and `getAvgOrderTimeByDay` sequentially inside a 3-iteration loop (12 serial round trips), and `Overall_Stats.jsx` awaits sales then orders. None of the effects cancel in-flight requests when `selectedDate` changes, so a slow response can overwrite a newer one. Use `Promise.all`, an `AbortController` (or a data library like TanStack Query), and cache per-day results.

6. **Replace hardcoded/dummy metrics with real data or remove them.** `getAvgOrderTime()`/`getAvgOrderTimeByDay()` in `Fetch_Data.jsx` return constants `5.5` and `2`; `Small_Line_Graph.jsx` charts a hardcoded 5-point `data` array (including a "12:00 AM" label that should be PM); `Food_List.jsx` ships a `generateDummyData` random-data generator; and the UTC offset in `getOrdersByHour` is hardcoded (`(hours - 4 + 24) % 24 // Adjusting for EDT`), which breaks outside daylight-saving time. Wire real endpoints, compute timezone via `Intl`/`toLocaleString` with `timeZone`, and delete the dummy generators.

7. **Improve chart accessibility and the donut's 13-hue palette.** The `DonutChart` in `Item_Sale.jsx` cycles 13 arbitrary Tailwind 500 hues (`yellow-500` next to `lime-500`, `blue` vs `sky` vs `cyan`) that are hard to distinguish and not colorblind-safe, and legend swatches are `aria-hidden` with no text alternative for the chart itself. Use a curated ordered categorical palette (6–8 max, group the tail into "Other"), add `aria-label`/visually-hidden data summaries, and consider a sorted horizontal bar instead of a 13-slice donut.

8. **Delete or finish dead code and unused dependencies.** `Credentials.jsx` is a non-functional static form (`action="#" method="post"`) superseded by `Auth_Ticket.jsx`, `Bar_Graph.jsx` and `Small_Line_Graph.jsx` are imported but commented out/unrendered, `Custom_Fonts.scss` is never imported, `FilterContext.jsx` imports `dayjs` without using it, and `package.json` carries MUI, Ant Design, styled-components, Emotion, and `@mui/x-date-pickers` that no source file uses. Pruning these cuts install/bundle size substantially and removes three conflicting UI kits from the project.

9. **Standardize number/currency formatting and typography.** Formatters are re-implemented per file with inconsistent output: `Overall_Stats.jsx` uses `Intl.NumberFormat` currency with 0 fraction digits, `Item_Sale.jsx` does manual `"$" + Intl.NumberFormat("us")…` (note the invalid `"us"` locale tag, also used in `Item_Numbers.jsx`, `Line_Info.jsx`, `Small_Line_Graph.jsx`), and `Insights.jsx` renders raw `` `$${data.ARO}` `` with an invisible-character `sub: "‎"` hack for alignment. Create one shared `format.js` (currency, count, percent, date) with proper `"en-US"` locales, and apply the loaded Inter font globally (`font-family` on `body` or Tailwind `fontFamily.sans`) so metrics use consistent tabular numerals.

10. **Add dashboard chrome: header, date-range context, and export.** The `/app` view (`App.jsx` `Dashboard()`) renders bare cards with no page title, no indication of which day/range is displayed, no last-updated timestamp, and no way to refresh or export. Add a top app bar (product name, active filter chip, refresh button, operator name from `profile.display_name`, sign-out — replacing the floating `SignOutFab` overlap risk with chart tooltips) and CSV/PNG export on each card, which is a baseline expectation for an analytics tool.
