# Noodle POS (JavaScript)

Offline-first point of sale for a small noodle / rice soup shop. Built for one cashier on a cheap Android tablet.

**Stack:** React, Vite (JavaScript), Tailwind CSS 3, Zustand, Dexie, Recharts, browser-image-compression, vite-plugin-pwa, date-fns, react-router-dom (latest stable).

## Install

```bash
npm install
```

## Develop

```bash
npm run dev
```

Opens on `http://localhost:5173`. The Network URL it prints works on a phone or tablet on the same Wi-Fi.

## Build

```bash
npm run build      # outputs ./dist
npm run preview    # serve the production build locally
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com choose **Add New → Project** and import the repository.
3. Vercel detects Vite (Build command `npm run build`, Output directory `dist`). Click **Deploy**.

Or with the CLI:

```bash
npm i -g vercel
vercel --prod
```

`vercel.json` rewrites all routes to `index.html`, so `/menu`, `/history`, etc. work on refresh.

## Install on the tablet

1. Open the deployed HTTPS URL in Chrome on the tablet (PWA install requires HTTPS).
2. Let it load once while online so the app is cached.
3. Chrome menu → **Install app**. It then opens full-screen and works offline. New versions download in the background and apply on the next visit.

## Notes

- Data lives in the tablet's IndexedDB. Use **Settings → Export JSON** regularly; **Import JSON** restores it (replaces current data).
- Changing currency changes display only. Prices are not converted.
- Tap a card = +1. Long-press a card or tap its **−** = −1. **Clear** and **Confirm** show an Undo toast for 5 seconds.
- Orders and menu items carry `createdAt`, `updatedAt` and `syncedAt` for a future cloud sync.
