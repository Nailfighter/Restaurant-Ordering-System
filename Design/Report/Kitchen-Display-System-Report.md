# Kitchen-Display-System (KDS) — Frontend Report

## 1. Overview

The Kitchen-Display-System is the kitchen-facing frontend of the Restaurant-Ordering-System. It shows kitchen staff a live board of incoming orders as color-coded ticket cards, lets them advance orders through `Preparing → Delayed → Completed` states, and plays a notification sound when a new order arrives. Order data comes from a REST backend (`VITE_API_URL`, endpoints under `/api/kitchen/*` and `/api/kiosk/*`) and live updates arrive over a WebSocket (`VITE_WSS_URL`). Authentication is handled by Supabase (project shared with the kiosk), with an operator-approval gate: only users whose `operator_profiles` row grants `access_kitchen` (or admins) can open the board.

**Tech stack** (`package.json`):

| Layer | Choice |
|---|---|
| Framework | React 18.3 + Vite 5 |
| Routing | react-router-dom 7 (`/login`, `/app`, catch-all redirect) |
| Auth / backend-as-a-service | @supabase/supabase-js 2 (`supabaseClient.js`) |
| Realtime | Native `WebSocket` against `VITE_WSS_URL` |
| Animation | framer-motion 11 (auth ticket only) |
| Audio | howler 2 (`Notification.mp3`) |
| Styling | SCSS via `sass` (note: bogus `saas` and `scss` packages are also listed as dependencies) |

Source layout: `src/App.jsx` (routes + gating), `src/AuthContext.jsx`, `src/component/` (Header, Tabs, Active_Orders, Order_Card, Card_Buttons, Auth_Ticket, Approval_Pending, AuthGate), `src/Food_List.jsx` (static menu-name array), `src/styles/*.scss`.

## 2. Features

| Feature | Where |
|---|---|
| Route gating: `/login`, `/app`, wildcard redirect; unauthenticated → login, authenticated-but-unapproved → pending screen | `src/App.jsx` |
| Supabase session management, sign-in / sign-up / sign-out, `operator_profiles` fetch, per-service `access` map (`kiosk`, `dashboard`, `kitchen`), admin override | `src/AuthContext.jsx` |
| "Ticket"-styled login form: Sign In / Register modes with sliding pill tabs, print-out entrance animation, shake-on-error, decorative barcode and tear edge, reduced-motion respect (`MotionConfig reducedMotion="user"`) | `src/component/Auth_Ticket.jsx`, `src/styles/Auth_Ticket.scss` |
| Approval-pending screen ("Hold Tight") with operator name, "Check Access" re-fetch of profile, sign-out link | `src/component/Approval_Pending.jsx` |
| Service constants (`SERVICE.key = "kitchen"`) and a floating `SignOutFab` (exported but unused in this app — Header has its own sign-out) | `src/component/AuthGate.jsx` |
| Initial fetch of pending / delayed / completed orders plus per-order item lists (`Promise.all` fan-out) | `src/component/Active_Orders.jsx` |
| Live updates: WebSocket messages `NEW_ORDER` (plays sound + refetch) and `ORDER_STATUS_CHANGE` (refetch) | `src/component/Active_Orders.jsx` |
| New-order audio alert via Howler (`Notification.mp3`) | `src/component/Active_Orders.jsx` |
| Tab state (`Active` / `History`) shared through React context | `src/component/Tabs.jsx` (provider), consumed in `Header.jsx` and `Active_Orders.jsx` |
| Header: live clock (12-hour, ticking every second), Active/History segmented toggle with sliding dark indicator, sign-out button | `src/component/Header.jsx`, `src/styles/Header.scss` |
| Order card: zero-padded order number (`#001`), creation time, optional customer note, live elapsed-time pill (m:ss, ticking every second), status-colored header incl. a distinct "Starting" green for orders `Preparing` < 60 s | `src/component/Order_Card.jsx`, `src/styles/Order_Card.scss` |
| Item list with quantity × name, alternating row backgrounds (`#ebebeb` / `#ffffff`) | `src/component/Order_Card.jsx` |
| Drinks-only auto-complete: orders containing only item ids 12–15 (Water, Soda, …) are auto-PUT to `completed` and hidden from the board | `src/component/Order_Card.jsx` (`orderNumNotGoingBack`, `autoComplete`) |
| Status-change buttons per status: Preparing → Done/Delay, Delayed → Prepare/Done, Completed → Prepare Again; PUTs status with `updatedBy` = Supabase user id | `src/component/Card_Buttons.jsx` |
| Empty states: "No Active Orders" / "No Completed Orders" | `src/component/Active_Orders.jsx`, `src/styles/App.scss` (`.no-active-order`) |
| Item-id → display-name lookup table (13 hardcoded names) | `src/Food_List.jsx` |
| Responsive tweaks: order grid `auto-fill, minmax(300px, 1fr)`; clock hidden and sign-out label collapsed below 1080 px | `src/styles/App.scss`, `src/styles/Header.scss` |

## 3. UI / Frontend Look

**Overall aesthetic.** A dark "kitchen board" with bright, gradient-headed ticket cards — high-contrast, poster-like, clearly designed for a wall-mounted screen. The auth screen deliberately reuses the order-card language (the comment in `Auth_Ticket.scss` says: "Same structure as the kiosk ticket, re-skinned as a KDS order card … dark board, 'Starting' green gradient header, light body, dark gradient buttons, amber accent").

**Color palette** (all values quoted from the SCSS):

- Background board: `#191919` (`body`, and `$board` in `Auth_Ticket.scss`), header bar `#131313`, chip/tab containers `#292929`, active-tab indicator `#141414`.
- Accent amber: `#EBAB5E` for the clock, active tab text, sign-out icon, input focus underline, hover glow (`box-shadow: 0 0 15px 3px rgba(235, 171, 94, 0.35)`); darker amber `#d99a4e` for the operator name on the pending ticket.
- Status gradients (`Order_Card.scss`):
  - Starting: `linear-gradient(0deg, #5bddab 0%, #5edd5e 100%)` (green)
  - Preparing: `linear-gradient(180deg, #ecd04a 0%, #fca53e 100%)` (yellow→orange)
  - Delayed: `linear-gradient(0deg, #ef6b9f 0%, #f47171 100%)` (pink→red)
  - Completed: `linear-gradient(0deg, #3e71bd 0%, #5cb0bf 100%)` (blue)
- Card body "paper": `#ebebeb` with alternating item rows `#ebebeb`/`#ffffff`; buttons and timer pill use `$button-grad: linear-gradient(180deg, #242424 0%, #101010 100%)`.
- Muted text: `#676767` (empty state, hints), error red `#f47171`.

**Typography.** Custom `TT-Hoves` loaded in nine weights (100–900) from local `.otf` files (`Custom_Fonts.scss`); `TT-Interfaces` is also declared but never referenced. The stack everywhere is `"TT-Hoves", "Jokerman", sans-serif` — Jokerman as a fallback is almost certainly a joke/placeholder. Google's Rubik is imported at the top of `App.scss` but never used in any rule. Scale is large and display-oriented: `h1`/`h2` at 48 px, tab buttons and clock at 36 px, timer pill 24 px extra-bold, item names 20 px light (`h4`, weight 300), empty state 54 px at weight 200.

**Layout.** A 78 px flex header (clock chip left, 383 px segmented tab control centered via `flex: 4`, sign-out right), then a responsive CSS grid of cards: `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` with `gap: 30px` and a `margin: 50px` frame. Cards are two-part: gradient header (rounded top, `$border-radius: 15px`) with the number/time row and note, plus a timer pill absolutely positioned to straddle the header/body seam (`bottom: -26px`, `border-radius: 100px`); light body with the item list and dark action buttons.

**Animation.** Framer-motion is confined to the auth flow: the ticket "prints" in via an animated `clipPath: inset(...)` reveal with a settle (`duration: 1.0`, custom cubic-bezier), errors shake horizontally (`x: [0, -8, 8, -5, 5, 0]`), the mode toggle uses a shared `layoutId` sliding pill, and buttons scale on hover/tap. The main board is far more static: the header tab indicator slides with `transition: margin-left 0.2s ease` (driven by an inline style toggling `marginLeft` between `0%` and `50%`), and various `0.2s ease` color/box-shadow hovers. There is no animation when order cards appear, move between statuses, or leave.

**Ticket details.** The auth ticket adds skeuomorphic touches: a perforation line (`border-top: 3px dashed rgba(255, 255, 255, 0.6)`), dashed input underlines (`border-bottom: 3px dashed #c9c9c9`), a CSS-only barcode built from `repeating-linear-gradient(90deg, …)`, a zig-zag torn bottom edge from two 135° gradients, and a radial amber glow over the board background.

**Inconsistencies worth noting.** `src/styles/Tabs.scss` is a stale stylesheet (gray `.tab-button` styles on `#eee`/`#ddd`) whose classes appear nowhere in the JSX; the real tabs live in `Header.scss`. Active/inactive tab colors (`#EBAB5E` / `#E4E4E4`) are hardcoded as inline styles in `Header.jsx` rather than as an `.active` class.

## 4. 10 Improvements

1. **WebSocket reconnection and connection-status indicator.** In `Active_Orders.jsx` the socket is opened once in `useEffect`; `onclose` only does `console.log("WebSocket connection closed")` and there is no `onerror` handler. If the backend restarts or Wi-Fi blips, the board silently freezes showing stale orders — the worst possible failure mode for a kitchen. Add exponential-backoff reconnect, refetch on reconnect, and a visible "LIVE / RECONNECTING" badge in the header so staff can trust (or distrust) the screen.

2. **Move the drinks-only auto-complete out of render.** `Order_Card.jsx` calls `autoComplete()` (a `PUT` fetch) directly in the render body (`if (checkOnlyNotGoingBack(items)) { autoComplete(); return <></>; }`). Side effects during render violate React semantics and, because every WebSocket refetch re-renders every card, this can fire the same PUT repeatedly (and twice more under StrictMode). This belongs on the server, or at minimum in a `useEffect` guarded by order status. Related bug: `orderNumNotGoingBack = [12, 13, 14, 15]` but `Food_List.jsx` only defines 13 items — ids 14–15 don't exist.

3. **Error and loading states for all data fetching.** `fetchJson` in `Active_Orders.jsx` does `fetch(url)` then `response.json()` with no `response.ok` check, no `try/catch`, and no loading flag. Before the first fetch resolves, the board incorrectly flashes "No Active Orders"; if the API is down, the promise rejects silently and the screen stays empty forever. Add a loading state, an explicit error banner with a retry button, and distinguish "empty" from "failed" — a cook must never mistake an outage for "no orders".

4. **Escalating urgency on the elapsed-time timer.** `Order_Card.jsx` already ticks `elapsedTime` every second, but the timer pill (`.order-timer`, `Order_Card.scss`) looks identical at 0:30 and at 25:00 — same `$button-grad` dark pill, same 24 px white text. Kitchen displays conventionally escalate: turn the pill amber past a warning threshold and red (optionally pulsing) past an SLA breach, and auto-promote or at least visually flag long-running "Preparing" orders. The status colors only change when a human presses "Delay"; time-based urgency is the whole point of a KDS.

5. **Optimistic UI + failure feedback on status buttons.** `Card_Buttons.jsx` fires a fire-and-forget `fetch(...PUT...)` with no `.then`/`.catch`, no disabled/pending state, and no confirmation. The card only moves when the WebSocket broadcast triggers a refetch — so on a slow or failed request the cook taps "Done", nothing happens, and they tap again. Optimistically move the card (or show a spinner on the button), roll back with a toast on failure, and debounce repeat taps. Also fix the copy-paste `alt="done"` on the secondary button's icon.

6. **Bigger touch targets on the card action buttons.** The `.order-buttons button` rules in `Card_Buttons.scss` give `padding: 10px`, 16 px text, and 21 px icons — roughly a 40 px-tall target on a screen operated with greasy fingers, possibly through a glove or wrapped in cling film. WCAG/industry kitchen-UI guidance suggests ≥ 48–56 px targets. Increase padding and font size, add `:active` pressed feedback, and consider making "Delay" visually distinct (destructive/secondary styling) instead of two identical dark buttons where a mis-tap silently marks an order done.

7. **Stop hardcoding the menu in the frontend.** `Food_List.jsx` is a static 13-element array indexed by `Food_Name[item.item_id - 1]` in `Order_Card.jsx`. Any menu change in the database renders wrong names — or `undefined` — on the kitchen screen, and the special-case id list in improvement #2 compounds it. The item-fetch endpoint (`/api/kiosk/order-items/order/:num`) should return item names (a join server-side), or the app should fetch the menu once at startup and look up by id, not array position.

8. **Fix the N+1 refetch storm and per-render Howl allocation.** Every WebSocket message triggers `fetchOrdersAndItems()`, which refetches *all three* status lists and then issues one request *per order* for its items (`allOrders.map(order => getOrderItemsByNum(...))` in `Active_Orders.jsx`) — dozens of requests per keystroke of kitchen activity, plus a visible risk of out-of-order responses. Include order payloads in the WS message or add a single `/api/kitchen/board` endpoint. Also, `const sound = new Howl({...})` is created on every render of `ActiveOrders`; hoist it to module scope or a `useRef`, and add a mute toggle — `Mute-Volume.png` / `Full-Volume.png` icons already exist in `public/Icon/` but are never used.

9. **Accessibility pass: color-only status, missing alt/aria, inline styles.** Order status is conveyed *only* by the header gradient (`order-header-Preparing` vs `-Delayed` etc. in `Order_Card.scss`) — no text label, so it fails for color-blind staff and low-quality displays; add a status word ("DELAYED") in the header. The clock `<img src="Icon/clock.png" />` in `Header.jsx` has no `alt`; the tab buttons signal active state purely via inline `style={{ color: ... }}` with no `aria-selected`/`role="tab"`; new-order arrivals have no `aria-live` announcement. Move the hardcoded `#EBAB5E`/`#E4E4E4` inline colors into an `.active` class in `Header.scss` while at it.

10. **Clean up dead styles, dead deps, and fragile date handling.** `src/styles/Tabs.scss` styles classes (`.tab-button`, `.tab-content`) that no component uses; the Rubik Google-font import in `App.scss` and the entire `TT-Interfaces` face in `Custom_Fonts.scss` are never referenced (the Google import also blocks first paint); `package.json` ships `dotenv`, `saas` (typo package), and `scss` — none needed in a Vite client. In `Order_Card.jsx`, `convertAndAdjustDate` contains a no-op `date.setHours(date.getHours())` (leftover timezone hack), and `formatTime` strips seconds by locale-dependent string slicing (`time.slice(0, -6) + time.slice(-3)`) that breaks on 24-hour or non-`h:mm:ss AM` locales — use `toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })` instead. Small cleanups, but they harden the exact code paths a wall display runs 12 hours a day.

---
*Report generated from a full read of `Kitchen-Display-System/src`, `index.html`, and `package.json` on 2026-07-15. No source files were modified.*
