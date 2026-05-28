# Artha

> Smart GST accounting for fruit & vegetable businesses

Artha replaces paper notebooks with proper GST invoices, real-time party ledgers, daily profit reports, and a cashbook — built for Azadpur, Ghazipur, and mandis across India.

---

## What's Inside

```
artha/
├── backend/     # FastAPI + PostgreSQL API
└── frontend/    # React + Vite web app
```

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, Tortoise ORM, PostgreSQL |
| Auth | JWT + bcrypt |
| Payments | Razorpay (UPI, Cards, Net Banking) |
| Package mgr | uv (Python), npm (Node) |

---

## Features

- **Sales & Purchases** — multi-line GST invoices with auto CGST/SGST/IGST calculation
- **PDF Invoices** — download or share via WhatsApp
- **Party Ledger** — running balance per customer/supplier
- **Items Master** — product catalogue with HSN codes and GST slabs
- **Cashbook** — cash receipts, payments, opening balance, cash-in-hand
- **Reports** — daily snapshot, GST summary (GSTR-1 view), party-wise P&L
- **Company Logo** — upload, preview (lightbox), change or remove
- **Subscription** — 3 / 6 / 12 month plans via Razorpay
- **Dark Mode** — polished light & dark themes
- **Account Management** — edit profile, change password

---

## Quick Start (Local)

### 1 — Backend

```bash
cd backend

# Install dependencies
uv sync

# Create database
psql -U your_pg_user -d template1 -c "CREATE DATABASE artha;"

# Configure
cp .env.example .env
# Fill in DATABASE_URL and SECRET_KEY

# Run
uv run uvicorn app.main:app --reload --port 8001
```

API docs → http://localhost:8001/docs

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

App → http://localhost:5173

Vite proxies `/api` and `/uploads` to the backend automatically in dev.

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgres://user@localhost:5432/artha
SECRET_KEY=change-this-to-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env.local`)

```env
# Leave blank in dev — Vite proxy handles it
VITE_API_URL=
```

---

## Subscription Plans

| Plan | Price | Savings |
|------|-------|---------|
| 3 Months | ₹199 | — |
| 6 Months | ₹349 | Save 12% |
| 12 Months | ₹599 | Save 25% |

---

## Deployment

### Backend → Railway

1. Push to GitHub
2. New project on [railway.app](https://railway.app) → deploy `backend/` folder
3. Add PostgreSQL plugin (DATABASE_URL auto-injected)
4. Set env vars in Railway dashboard
5. Add a Railway Volume mounted at `/app/uploads` for logo persistence

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com) → set Root Directory to `frontend`
2. Add env var: `VITE_API_URL=https://your-backend.railway.app`
3. Deploy — `vercel.json` handles SPA routing

### Post-deploy checklist

- [ ] Set a strong `SECRET_KEY` (32+ chars)
- [ ] Switch Razorpay keys from `rzp_test_` → `rzp_live_`
- [ ] Add your Vercel URL to `ALLOWED_ORIGINS`
- [ ] Mount Railway Volume at `/app/uploads`

---

## Project Docs

- [Frontend README](./frontend/Readme.md)
- [Backend README](./backend/README.md)

---

## License

Private & confidential — Mandii Mart © 2026
