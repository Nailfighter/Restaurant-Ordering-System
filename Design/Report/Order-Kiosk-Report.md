# Order-Kiosk Frontend Report

Service path: `Order-Kiosk/` — analyzed on 2026-07-15. All findings verified against source in `Order-Kiosk/src`.

---

## 1. Overview

The Order-Kiosk is the customer-facing / operator-driven self-ordering screen of the Restaurant-Ordering-System. A staff "operator" signs in (Supabase auth), the kiosk shows a tabbed food menu of Indian street food, items are added to a live order panel, and confirmed orders are POSTed to the backend API where the kitchen and dashboard services pick them up. It also contains an admin panel for approving operators and granting per-service access.

**Tech stack** (`package.json`):

- **React 18.3** + **Vite 5** (`@vitejs/plugin-react`), ESLint
- **react-router-dom 7** — routes `/login`, `/app`, `/admin` (`src/App.jsx`)
- **framer-motion 11** — all animation (springs, `AnimatePresence`, `layoutId` pills, clip-path "print out" effect)
- **Sass** — component SCSS files under `src/styles/scss/`
- **@supabase/supabase-js 2** — auth + `operator_profiles` table + RPCs (`src/supabaseClient.js`, `src/AuthContext.jsx`)
- REST calls to a Node API via `VITE_API_URL` (`/api/kiosk/orders`, `/api/kiosk/order-items`, `/api/test`)
- State via plain React Contexts: `Cart.jsx`, `ConfirmationContext.jsx`, `WidthContext.jsx`, `AuthContext.jsx`
- Note: `mysql2`, `dotenv`, `env-cmd`, and `simplebar` sit in frontend `dependencies` but are never imported in `src/` — leftovers from the pre-Supabase era.

---

## 2. Features

| Feature | File(s) |
|---|---|
| Route gating: `/login`, `/app`, `/admin`, wildcard redirect; approval + admin checks | `src/App.jsx` |
| Auth session, profile fetch (`operator_profiles`), `signIn/signUp/signOut`, role flags (`isAdmin`, `isSuperAdmin`), per-service `access` map (kiosk/dashboard/kitchen) | `src/AuthContext.jsx` |
| Ticket-style login screen ("printed receipt" with stub, perforation, dashed-line fields, fake barcode, torn zigzag edge); sign-in/register tab pill; email-confirmation state; error shake | `src/component/Auth_Ticket.jsx`, `src/styles/scss/Auth_Ticket.scss` |
| Alternate split-panel auth design (brand panel + fanned, bobbing food showcase cards) selected by the `AUTH_DESIGN = "ticket"` constant | `src/component/Auth.jsx`, `src/styles/scss/Auth.scss`, `src/App.jsx` |
| Approval-pending screen (same ticket look, "Hold Tight", Check Approval / sign-out) | `src/component/Approval_Pending.jsx` |
| Admin panel: operator list with created date, role badges, per-service access chips (Kiosk / Kitchen / Dashboard), promote to admin, super-admin-only demote/delete, pending-count header | `src/component/Admin.jsx`, `src/styles/scss/Admin.scss` |
| Danger Zone: "Delete All Data" flow — counts orders/items, PIN-gated `admin_delete_all_data` RPC, three-step modal | `src/component/Danger_Zone.jsx`, `src/styles/scss/Admin.scss` |
| Header: order-number search box (Enter to fetch), order details overlay (items, status, timestamps, created/updated by, "Not Created" fallback), Admin nav button (admins only), Sign Out button | `src/component/Header.jsx`, `src/styles/scss/App.scss` |
| Menu category tabs (All / Box / Combo / Entree / Drinks) with spring hover/tap and slide-in of the card grid | `src/component/Menu.jsx` |
| Hardcoded menu data: 13 items with image, name, alias, price, allergen/temp tags | `src/Food_List.jsx` |
| Food card: photo, auto-shrinking title, tag chips, price flag, quantity selector | `src/component/Food_Card.jsx`, `src/styles/scss/Food_Card.scss` |
| Allergen/attribute tag chips (Nuts, Gluten, Vegan, Diary [sic], Egg, Cold) with per-tag colors | `src/component/Tag.jsx`, `Food_Card.scss`, `Tag.scss` |
| Quantity selector (− / count / +) with directional number roll animation; pushes `{id, name, alias, price, quantity}` into the cart | `src/component/Quantiy_Selector.jsx` (filename typo), `Quantiy_Selector.scss` |
| Cart context: add/update/remove-at-zero, total, clear | `src/Cart.jsx` |
| Order review sidebar: item list, animated total, free-text note, cancel (undo icon) and "Place Order"; POSTs order to API | `src/component/Order_Review.jsx`, `src/component/Order_Item.jsx`, `src/styles/scss/Order_Review.scss` |
| Confirmation overlay: giant ticket graphic showing "Your Order Number is #NNN" for ~5 s (number fetched from `/api/kiosk/orders/last`) | `src/component/Confirmation_Screen.jsx`, `.overlay/.ticket` in `App.scss` |
| API heartbeat: `/api/test` polled every 10 s, `alert()` on failure | `src/App.jsx` |
| Sidebar width sync: `.space` spacer div measured on resize, width copied into the fixed `.order` panel via context | `src/App.jsx`, `src/WidthContext.jsx`, `src/component/Order_Review.jsx` |
| Resolution checker debug readout (`window.innerWidth x innerHeight`) — imported in `App.jsx` but not currently rendered | `src/component/Resolution_Checker.jsx` |

---

## 3. UI / Frontend Look

### Color palette (from `App.scss` and friends)

- **Brand oranges**: `$primary-color: #faaf79` (card outlines, price flags), `$secondary-color: #fb944a`, selected tab `#f9964f`, and the signature button/accent gradient `$quantity-grad: linear-gradient(0deg, #f98e47 0%, #faaf79 100%)`.
- **Warm background**: `$counter-grad` — a layered "counter-top" of coral radial glows (`rgba(249,142,71,.28)`, `rgba(244,113,113,.22)`), faint 45° awning stripes, over a peach gradient `linear-gradient(165deg, #ffddab, #ffe7c9, #fef0de)`, `background-attachment: fixed`.
- **Dark charcoal panels**: `$order-background-grad: linear-gradient(0deg, #31343f 0%, #282a33 40%)` for the order sidebar, admin panel, and order-search modal; row surfaces `#25262b`, inputs `#363944`, muted text `#6f6f6f` / `#b8b8b8` / `#ababab`.
- **Ticket paper**: `$paper: #fffdf8` with warm shadow `0px 24px 50px rgba(180,90,40,0.35)`; parchment neutrals `#f1ede4`, `#e0d9c9`, `#d4ccba` (`Auth_Ticket.scss`).
- **Semantic/tag colors**: danger `#ff4141`; tag chips Nuts `#b07969`, Gluten `#ffc0b0`, Vegan `#c9f79a`, Diary `#b1ebfa`, Egg `#ffdc7d`, Cold `#b1c4fa` (all with white 12px text).

### Typography

Two self-hosted commercial families registered at 9 weights each in `Custom_Fonts.scss`: **TT-Hoves** (body, buttons, inputs) and **TT-Interfaces** (display — the `h2` category header, price flags, "Hungry?" headline). Fallback stack is the eyebrow-raising `"Jokerman", sans-serif`. Scale is big and kiosk-loud: `h2` 64px/800, `h1` 54px/800 white, `h5` 48px/800 with gradient-clipped text (`-webkit-background-clip: text`), food card titles 30px, and the confirmation ticket number a massive **270px / weight 900 with 15px letter-spacing**. An Inter Google-Fonts `@import` at the top of `App.scss` is loaded but never referenced.

### Layout

- Kiosk (`/app`): flex row — `.main` (menu, `margin: 36px`, `flex: 7`) plus an empty `.space` spacer (`min-width: 404px`, `flex: 2.625`) that reserves room for the `position: fixed` right-hand `.order` panel (`max-width: $order-width` = 484px, `height: calc(100vh - 20px)`, radius 15px).
- Food grid: flex-wrap `.containner` [sic] with 40px gaps; card widths stepped by media queries (`22%` ≥1626px, `30%`, `45%`, `100%` <965px). Cards are white, `border-radius: 15px`, with a chunky `outline: 6px solid #faaf79` and an orange glow on hover (`box-shadow: 0 0 15px 5px rgba(249,142,71,0.6)`).
- Auth ticket: centered 420px paper column — gradient stub, 3px-dashed perforation band, dashed-underline receipt fields, CSS `repeating-linear-gradient` barcode, and a zigzag tear built from two 135° linear gradients (`background-size: 14px 14px`).
- Admin: centered 920px dark panel of flex-wrap operator rows with pill chips and action buttons.

### Motion

framer-motion everywhere: spring presets (`{type:"spring", stiffness: 260–500, damping: 10–30}`), `whileHover`/`whileTap` scale bounces on nearly every button (1.03–1.1 / 0.9–0.96), `AnimatePresence mode="wait"` for auth card swaps, `layoutId` sliding pill for the Sign In/Register tabs, staggered children (`staggerChildren: 0.06–0.14`), an error shake keyframe array (`x: [0,-8,8,-5,5,0]`), the ticket "printing" reveal via animated `clipPath: inset(...)`, quantity numbers rolling up/down based on previous value, and a CSS `cardBob` float (4s alternate) plus `moveBackground` wave loop on the auth panel. Auth/Admin screens wrap in `<MotionConfig reducedMotion="user">`; `Auth.scss` adds a `@media (prefers-reduced-motion: reduce)` fallback.

### Overall aesthetic

A warm, playful "street-food stand" identity: peach counter-top backdrop, fat rounded corners (radii 10–25px), thick orange outlines, gradient-filled display numerals, dark charcoal receipt/terminal panels for contrast, and a skeuomorphic printed-ticket motif carried from login through order confirmation. Confident and cohesive, tuned for a large touchscreen.

---

## 4. Ten Improvements

1. **Replace the hardcoded menu and id-range category filtering with data-driven categories.** `src/Food_List.jsx` hardcodes all 13 items, and `Menu.jsx` maps tabs to id ranges (`Box: [1, 5]`, `Combo: [6, 9]`, `Entree: [10, 10]`) — inserting one item renumbers every category, and `All: [1, 15]` already over-shoots the real max id (13). Every card is also always rendered and merely hidden with `show="none"`. Improvement: fetch menu items (they already live in Supabase per the migration) with a `category` field, filter the array before rendering, and derive tabs from the data.

2. **Move quantity state out of the cards and add item removal in the order panel.** Each `Quantiy_Selector.jsx` keeps its own `curQuantity` and syncs via a `useEffect([curQuantity])` that fires `addToCart` even on mount with quantity 0; clearing the cart is detected by an effect keyed on the `clearCart` function reference plus a `cart.length` check — fragile, and `Order_Review.jsx` offers no way to remove or edit a single line (only nuking the whole cart via Cancel, or walking back to the card). Make the cart context the single source of truth (`quantities` keyed by item id) and add per-row +/−/remove controls in `Order_Item.jsx`.

3. **Kill the `alert()` heartbeat.** `App.jsx` polls `${apiURL}/api/test` every 10 seconds and calls `alert("Internet or API connection failed")` on any failure — on a kiosk with a flaky network this throws a blocking native dialog every 10 s and freezes the animation loop. `Order_Review.jsx` also uses `alert("Cart is empty!")`. Replace with a non-blocking styled banner/toast ("Offline — orders can't be placed") that disables the Place Order button, matching the app's visual language.

4. **Fix the order-confirmation race and silent failure.** `Order_Review.jsx` `addOrderToDB()` fires the POST and ignores both the response and any error, then immediately clears the cart and shows the confirmation; `Confirmation_Screen.jsx` separately fetches `/api/kiosk/orders/last` to display the number. If the POST fails the customer still sees a (stale) order number, and two kiosks placing orders simultaneously can show each other's number. Improvement: `await` the POST, take `order_num` from its response, show an error state (and keep the cart) on failure.

5. **Replace the manual JS font-shrink loops with CSS.** Both `Food_Card.jsx` and `Order_Review.jsx` run a `while (element.scrollWidth > element.clientWidth) fontSize--` loop inside resize listeners — layout-thrashing per card, and the `Order_Review` effect has **no dependency array**, so it re-runs and re-attaches a listener on every render. Use CSS instead: `font-size: clamp(26px, 2vw, 30px)` plus `text-overflow: ellipsis`/`overflow: hidden`, or `container-query` units — and delete both effects.

6. **Remove the hardcoded timezone offset.** `Header.jsx` `convertDate()` does `date.setHours(date.getHours() - 4)` — correct only for EDT; every winter (EST, UTC−5) and any other deployment shows wrong order times. Have the API return ISO-8601 UTC timestamps (`...Z`) and let `toLocaleTimeString()` do the conversion, or use `Intl.DateTimeFormat` with an explicit `timeZone` option.

7. **Close the accessibility gaps.** Verified issues: the +/− quantity buttons, the order-overlay close button, and the cancel button in `Order_Review.jsx` are icon-only with no `aria-label` (their `<img alt>`s say "minus"/"plus"/"Cancel" at best); the search `<input>` in `Header.jsx` has no label and its `onBlur` wipes the typed value; most SCSS removes `outline: none` on inputs (`.search-box`, `App.scss`) without a `:focus-visible` replacement; tag chips render white 12px text on `#c9f79a`/`#ffdc7d`/`#ffc0b0` (contrast far below WCAG AA); and the 28px `button-less` target (`Quantiy_Selector.scss`) is under the 44px touch minimum for a kiosk. Add labels, visible focus rings, dark text on light chips, and ≥44px hit areas.

8. **Extend reduced-motion support to the kiosk itself.** `Auth.jsx`, `Auth_Ticket.jsx`, `Approval_Pending.jsx`, and `Admin.jsx` wrap in `<MotionConfig reducedMotion="user">`, and `Auth.scss` has a `prefers-reduced-motion` block — but the main kiosk (`Header`, `Menu`, `Food_Card`, `Order_Review`, `Confirmation_Screen`) has neither, so tab switches, card pops, and the spring ticket still animate for motion-sensitive users. Wrap the app once in `MotionConfig reducedMotion="user"` at `main.jsx`/`App.jsx` level and add a global reduced-motion CSS block.

9. **Drop the fixed-resolution scaffolding.** The layout leans on magic sizes: the invisible `.space` div (`min-width: 404px`, `width: $order-width + 20px`) whose computed width is copied via `WidthContext` into the fixed `.order` panel through direct `style.width` mutation (`Order_Review.jsx`), the confirmation `.ticket` locked to a `820px x 470px` PNG background with a 270px heading (`App.scss`), and a dedicated `Resolution_Checker.jsx` debug readout. Improvement: use CSS Grid (`grid-template-columns: 1fr 484px`) so the order panel participates in layout naturally (deleting `WidthContext` and the spacer), and rebuild the confirmation ticket in CSS (the `Auth_Ticket.scss` stub/perforation/tear technique already proves it) so it scales to any screen.

10. **Add loading, error, and empty states to data screens.** `Admin.jsx` `loadOperators()` ignores the Supabase `error` and renders an empty list with no spinner; `toggleAccess`/`promote`/`runDestructive` never surface failures (button just un-disables); "Delete Account" fires with no confirmation dialog; `Header.jsx` order search shows nothing between Enter and response and treats fetch errors as "Not Created" (misleading — a network error reads as a nonexistent order); `Confirmation_Screen.jsx` shows `#000` if its fetch fails. Add skeleton rows / an inline spinner, distinct "couldn't load" messaging with retry, a confirm step for destructive admin actions, and optimistic chip toggles with rollback.

**Smaller polish items noticed along the way:** file/class typos (`Quantiy_Selector`, `.containner`, tag `Diary` → *Dairy*, `Panner` → *Paneer*); unused deps (`mysql2`, `simplebar`, `dotenv`) and the unused Inter font import in `App.scss`; `Resolution_Checker` imported but unrendered in `App.jsx`; and `Food_List` item 11's `comboPrice: 3` which nothing reads.
