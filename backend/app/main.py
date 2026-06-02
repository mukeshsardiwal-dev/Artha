import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from tortoise.contrib.fastapi import RegisterTortoise

from app.config import TORTOISE_ORM, settings
from app.routers import (
    auth,
    business,
    cashbook,
    invoices,
    items,
    parties,
    reports,
    transactions,
)
from app.telemetry import setup_telemetry

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# ── Telemetry — must be initialised before the FastAPI app is created ──────
# Configures tracing (spans) and injects trace_id/span_id into every log line.
# Controlled entirely via environment variables; safe no-op when vars are unset.
setup_telemetry(
    service_name=settings.OTEL_SERVICE_NAME,
    otlp_endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT,
    otlp_headers=settings.OTEL_EXPORTER_OTLP_HEADERS,
    enable_console=settings.OTEL_CONSOLE,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with RegisterTortoise(
        app,
        config=TORTOISE_ORM,
        generate_schemas=True,
        add_exception_handlers=True,
    ):
        yield


app = FastAPI(
    title="Artha API",
    version="1.0.0",
    description="Smart GST accounting backend for businesses",
    lifespan=lifespan,
)

# Auto-instrument every incoming HTTP request: creates a root span per request
# and records HTTP method, route, status code, and latency automatically.
FastAPIInstrumentor.instrument_app(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(business.router, prefix="/api/v1")
app.include_router(parties.router, prefix="/api/v1")
app.include_router(items.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(cashbook.router, prefix="/api/v1")
app.include_router(invoices.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Artha API"}
