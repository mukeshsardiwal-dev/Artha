# Artha — Frontend

React + Vite + TypeScript web application for Artha — smart GST accounting for businesses.

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| State | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | React Hot Toast |

## Project Structure

```
src/
├── api/              # Axios API functions (auth, business, transactions…)
├── components/
│   ├── layout/       # Sidebar, Header, Layout wrapper
│   ├── ui/           # Reusable: Button, Card, Input, Modal, Badge…
│   └── SubscriptionModal.tsx
├── lib/              # Utilities (formatCurrency, cn, constants)
├── pages/
│   ├── auth/         # Login, Register
│   ├── Dashboard.tsx
│   ├── Sales.tsx
│   ├── Purchases.tsx
│   ├── Parties.tsx / PartyDetail.tsx
│   ├── Items.tsx
│   ├── Cashbook.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
├── stores/           # authStore, themeStore (Zustand)
└── types/            # Shared TypeScript interfaces
```

## Local Development

### Prerequisites
- Node.js 18+
- Backend running on port 8001 (see `backend/README.md`)

### Setup

```bash
cd frontend
npm install
```

Create a local env file (leave `VITE_API_URL` blank — Vite proxy handles it in dev):

```bash
cp .env.example .env.local
```

### Run

```bash
npm run dev
```

App available at **http://localhost:5173**

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:8001` automatically.

### Build

```bash
npm run build        # Production build → dist/
npm run preview      # Preview the production build locally
```

## Environment Variables

| Variable | Required in prod | Description |
|----------|-----------------|-------------|
| `VITE_API_URL` | Yes | Backend base URL e.g. `https://artha.railway.app` |

In development this is left blank — the Vite proxy in `vite.config.ts` forwards requests to localhost.

## Key Features

- **Dashboard** — Today's sales, purchases, gross profit, cash in hand, top items chart
- **Sales & Purchases** — Multi-line GST invoice entry with CGST/SGST/IGST auto-calculation
- **Party Ledger** — Running balance per customer/supplier with date filter
- **Items Master** — Product catalogue with HSN codes and GST rates
- **Cashbook** — Cash receipts/payments with opening balance
- **Reports** — Daily report, GST summary (GSTR-1 view), party-wise P&L
- **Settings** — Business profile, company logo, account details, password change, subscription
- **Subscription Gate** — Razorpay payment flow for 3m/6m/12m plans
- **Dark Mode** — Toggleable, persisted to localStorage

## Deployment (Vercel)

1. Import the repo in **vercel.com** → set Root Directory to `frontend`
2. Add environment variable: `VITE_API_URL=https://your-backend.railway.app`
3. Vercel detects Vite automatically — build command `npm run build`, output `dist/`
4. `vercel.json` handles SPA routing (all paths → `index.html`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Serve the production build locally |
