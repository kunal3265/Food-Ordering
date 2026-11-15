# Forkfast — Food Ordering

A complete fast-food ordering site: a rich marketing home page backed by a
working ordering flow, from browsing the menu to tracking a delivery. Prices
are in Indian rupees (₹), with 5% GST, and the store is based in Vijayawada.

## What's inside

- **Home** — deep-green hero with a floating burger, promo cards, top picks,
  category board, flash deals with live countdowns, how-it-works and reviews.
- **Menu** (`/menu`) — search, category and dietary filters, saved dishes and
  sorting. Filters live in the URL, so reloading or sharing a link keeps them.
- **Dish pages** (`/menu/:slug`) — sizes, extras, kitchen notes and quantity,
  with the price updating as the dish is built.
- **Cart drawer** — quantities, removal and a free-delivery meter. Kept in
  `localStorage`.
- **Checkout** (`/checkout`) — delivery or pickup, details, address, time slot,
  payment, rider tip and promo codes. The Worker validates and prices the
  order server-side, so the total charged always matches what the page shows.
- **Order tracking** (`/orders/:reference`) — an order moves through placed,
  preparing, packed, on the way and delivered over about three minutes, with an
  illustrated route map. **My orders** (`/orders`) lists past orders with
  one-tap reorder.
- **Offers**, **Reviews** (with a review form), **About** (with a contact form),
  a 404 page and a live style guide at `/styleguide`.

## Tech

React 19 · Vite 8 · TypeScript · Tailwind CSS 4 · Hono on Cloudflare Workers ·
React Router · Motion · Lucide icons.

Pricing and validation live in `src/shared/`, shared by the browser and the
Worker so the two can never disagree.

## Getting started

```sh
npm install
npm run dev        # http://localhost:5308 — Vite plus the Worker in workerd
npm run build      # dist/client (assets) + dist/food_ordering/index.js (Worker)
npm run typecheck
```

## Standalone HTML build

The whole storefront can also be built into a single HTML file that runs
straight from disk, with no server:

```sh
npm run build:file   # writes dist-file/index.html (open it directly)
npm run file         # build, then open it in the default browser
npm run file:watch   # rebuild automatically whenever src/ changes
```

Keep the `images/` folder next to `index.html`. Browsing, filters, the cart,
saved dishes, order history and order tracking all work offline. The forms and
checkout call the Worker API, so those need the dev server or a deployment.

## Editing the site

- **`src/data.ts` holds every string, price and dish.** `SITE` has the name,
  contact details, hours, fees and tax rate; `CATEGORIES` and `MENU` the dishes
  with sizes and extras; `FLASH_DEALS`, `PROMO_CODES`, `HERO`, `PROMOS`,
  `TOP_PICKS`, `STEPS`, `STATS`, `REVIEWS`, `ABOUT`, `NAV` and `FOOTER` the rest.
- **Photos** go through `PHOTOS`; placeholders are transparent WebP cut-outs in
  `public/images/photos/`, with SVG avatars in `public/images/people/`.
- **Pricing** is in `src/shared/pricing.ts`, **validation** in
  `src/shared/validation.ts`. Prices use charm pricing (they end in 9), and
  flash-deal prices are rounded the same way.
- **Pages** live in `src/pages/`, routes in `src/App.tsx`, components in
  `src/components/`, and the cart/saved/orders store in `src/lib/store.tsx`.

### Promo codes

| Code | Offer | Minimum |
| --- | --- | --- |
| `FIRSTBITE` | 20% off a first order | ₹1,299 |
| `FREESHIP` | Free delivery | ₹1,699 |
| `FEAST10` | ₹849 off a feast | ₹4,199 |

### Worker routes (`src/worker/index.ts`)

| Route | Does | Returns |
| --- | --- | --- |
| `GET /api/health` | Health check | `200 { ok: true }` |
| `GET /api/menu` | Dishes with live prices | `200` |
| `POST /api/promo` | Checks a code against a cart | `200` with the discount, `422` with the reason |
| `POST /api/orders` | Validates and prices an order | `201` with a reference and quote, `422` with `fieldErrors` |
| `POST /api/reviews`, `/api/contact`, `/api/subscribe` | Form submissions | `201`, or `422` with `fieldErrors` |

A body that is not a JSON object returns `400`; any other `/api/*` path returns
a JSON `404`. Nothing is stored — this is a demo storefront and takes no
payment.

## Deploying

`npm run build` produces a Worker entrypoint plus static assets, deployable to
Cloudflare Workers. Wire `POST /api/orders` to a payment provider and a
database to take real orders.

For a static host such as Vercel, `npm run build:web` writes a plain folder of
assets to `dist-web` (browser bundle only, no Worker) and `vercel.json` points
the host at it with an SPA rewrite. Browsing, cart and order tracking work
there; the form and checkout endpoints need the Worker, so they return 404 in
the static deployment.
