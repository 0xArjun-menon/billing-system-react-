# Onam POS System — React (No Server)

A fully client-side version of the Onam Sadhya & Curry POS system. There is
**no backend server** — the app runs entirely in the browser and stores all
data (products, bills, customers) in the browser's `localStorage`.

## Tech Stack

- React 18
- React Router (HashRouter — works from any static host or even a plain
  double-clicked `index.html` after building, no server-side routing needed)
- Vite (dev server + build tool)
- Plain CSS (no UI framework dependency) — Onam-themed palette (marigold
  gold, deep maroon, banana-leaf green, warm cream)
- `localStorage` as the data layer (see `src/data/store.js`)

## Features

- **Dashboard** — today's sales, revenue, best sellers, low-stock alerts
- **Billing** — searchable product grid, cart, quantity controls, discount/tax,
  Cash/UPI/Card payment selection, generates a unique bill number, printable
  receipt
- **Products** — add/edit/delete, search/filter, stock and availability
- **Customers** — add/edit/delete, purchase history per customer
- **Billing History** — search by bill number/date, reprint receipts, delete
  a bill (restores stock automatically), with a styled confirmation dialog
- **Reports** — daily/weekly/monthly revenue, average order value, a simple
  bar chart of revenue by day, and best sellers

## Running it

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## Building for deployment

```bash
npm run build
```

This produces a `dist/` folder. Since there's no server, you can:
- Open `dist/index.html` directly in a browser, **or**
- Upload the `dist/` folder to any static host (GitHub Pages, Netlify,
  Vercel, S3, etc.) — no server-side configuration needed.

## Data storage & limitations

All data lives in the browser's `localStorage` under the key
`onam-pos-data-v1`. This means:

- Data persists between visits **on the same browser, same device**.
- Clearing browser data/cache will erase it.
- Data is **not shared** across devices or browsers — this is a
  single-device/single-user tool by design, since there's no server.
- If you outgrow this and want multi-device sync, real persistence, or
  multi-user access, you'd need to reintroduce a backend (Node/Express +
  a real database) — the previous full-stack version of this project can
  serve as a starting point for that.

## Resetting demo data

The app seeds itself with 20 sample products on first load. To wipe
everything and reseed, open the browser console on the app and run:

```js
localStorage.removeItem('onam-pos-data-v1');
```

Then refresh the page.
