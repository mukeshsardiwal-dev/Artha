# Artha — Backend

FastAPI + Tortoise ORM + PostgreSQL backend for Artha — smart GST accounting for businesses.

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | FastAPI 0.115 |
| ORM | Tortoise ORM + asyncpg |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Validation | Pydantic v2 |
| PDF | Jinja2 templates |
| Package manager | uv |
| Server | Uvicorn |

## Project Structure

```
app/
├── main.py           # App factory, CORS, static files, router registration
├── config.py         # Settings from .env (pydantic-settings)
├── deps.py           # FastAPI dependencies (get_current_user, get_current_business)
├── models/           # Tortoise ORM models
│   ├── user.py
│   ├── business.py
│   ├── party.py
│   ├── item.py
│   ├── transaction.py
│   └── cashbook.py
├── schemas/          # Pydantic request/response schemas
├── routers/          # Route handlers
│   ├── auth.py       # Register, login, profile update, password change
│   ├── business.py   # Business profile, logo upload, subscription, Razorpay
│   ├── parties.py    # Customers & suppliers, ledger
│   ├── items.py      # Items master
│   ├── transactions.py # Sales & purchases
│   ├── cashbook.py   # Cash in hand
│   ├── invoices.py   # PDF invoice generation
│   └── reports.py    # Daily, GST summary, party-wise
└── services/
    ├── gst.py        # CGST/SGST/IGST calculation logic
    └── pdf_service.py # Invoice PDF generation
uploads/
└── logos/            # Business logo files (use cloud storage in production)
```

## Local Development

### Prerequisites
- Python 3.11+
- PostgreSQL running locally
- `uv` installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### Setup

```bash
cd backend

# Install dependencies
uv sync

# Create the database
psql -U your_pg_user -d template1 -c "CREATE DATABASE artha;"

# Configure environment
cp .env.example .env
# Edit .env with your values
```

### Environment Variables (`.env`)

```env
DATABASE_URL=postgres://your_user@localhost:5432/artha
SECRET_KEY=your-random-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Run

```bash
uv run uvicorn app.main:app --reload --port 8001
```

- API: **http://localhost:8001**
- Swagger docs: **http://localhost:8001/docs**
- Health check: **http://localhost:8001/health**

Tables are auto-created on first startup via Tortoise ORM's `generate_schemas=True`.

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/me` | Update name / email / phone |
| PUT | `/api/v1/auth/me/password` | Change password |

### Business
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/business` | Get business profile |
| POST | `/api/v1/business` | Create business profile |
| PUT | `/api/v1/business` | Update business profile |
| POST | `/api/v1/business/logo` | Upload company logo |
| DELETE | `/api/v1/business/logo` | Remove company logo |
| GET | `/api/v1/business/subscription/plans` | List subscription plans |
| POST | `/api/v1/business/subscription/create-order` | Create Razorpay order |
| POST | `/api/v1/business/subscription/verify` | Verify payment & activate |

### Parties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/parties` | List parties (filter by type/search) |
| POST | `/api/v1/parties` | Add party |
| PUT | `/api/v1/parties/{id}` | Update party |
| DELETE | `/api/v1/parties/{id}` | Delete party |
| GET | `/api/v1/parties/{id}/ledger` | Party ledger with running balance |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/items` | List items |
| POST | `/api/v1/items` | Add item |
| PUT | `/api/v1/items/{id}` | Update item |
| DELETE | `/api/v1/items/{id}` | Delete item |

### Transactions (Sales & Purchases)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | List (filter by type/date/party) |
| POST | `/api/v1/transactions` | Create sale or purchase |
| DELETE | `/api/v1/transactions/{id}` | Delete transaction |
| PATCH | `/api/v1/transactions/{id}/payment` | Update payment status |

### Cashbook
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cashbook` | List entries (filter by date) |
| GET | `/api/v1/cashbook/balance` | Cash in hand summary |
| POST | `/api/v1/cashbook/entries` | Add entry |
| PUT | `/api/v1/cashbook/entries/{id}` | Update entry |
| DELETE | `/api/v1/cashbook/entries/{id}` | Delete entry |

### Invoices & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/invoices/{id}/pdf` | Download invoice PDF |
| GET | `/api/v1/reports/daily` | Daily snapshot |
| GET | `/api/v1/reports/gst-summary` | GST summary (GSTR-1 view) |
| GET | `/api/v1/reports/party-wise` | Party-wise P&L |

## Subscription Plans

| Plan | Price | Duration |
|------|-------|----------|
| 3 Months | ₹199 | 90 days |
| 6 Months | ₹349 | 180 days |
| 12 Months | ₹599 | 365 days |

Payment via Razorpay. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.

## Deployment (Railway)

1. Push repo to GitHub
2. New project on **railway.app** → Deploy from GitHub → select `backend/` folder
3. Add PostgreSQL plugin — `DATABASE_URL` is auto-injected
4. Set environment variables in Railway dashboard
5. Railway detects `Dockerfile` and deploys automatically

See root `README.md` for full deployment guide.
