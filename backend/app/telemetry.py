"""
OpenTelemetry tracing and correlated logging setup.

Usage
-----
Call ``setup_telemetry()`` once at application startup (before creating the
FastAPI instance). Configure via environment variables:

    OTEL_SERVICE_NAME               Service name shown in your tracing backend
    OTEL_EXPORTER_OTLP_ENDPOINT     OTLP HTTP endpoint (e.g. Grafana Cloud, Honeycomb)
    OTEL_EXPORTER_OTLP_HEADERS      Comma-separated auth headers: "Key=Value,Key2=Value2"
    OTEL_CONSOLE                    "true" → also print spans to stdout (dev)
"""

import logging

from opentelemetry import trace
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

_logger = logging.getLogger(__name__)


class _SafeOtelFormatter(logging.Formatter):
    """
    Formatter that injects OpenTelemetry trace/span IDs into log records.

    Falls back to empty strings when no active span exists (e.g. during
    application startup before any request is being handled).
    """

    def format(self, record: logging.LogRecord) -> str:
        record.otelTraceID = getattr(record, "otelTraceID", "")  # type: ignore[attr-defined]
        record.otelSpanID = getattr(record, "otelSpanID", "")  # type: ignore[attr-defined]
        return super().format(record)


def _parse_headers(raw: str) -> dict[str, str]:
    """Parse ``"Key=Value,Key2=Value2"`` into a ``{key: value}`` dict."""
    headers: dict[str, str] = {}
    for pair in raw.split(","):
        key, _, value = pair.partition("=")
        key = key.strip()
        if key:
            headers[key] = value.strip()
    return headers


def _configure_root_logger() -> None:
    """Apply our trace-aware log format to the root logger."""
    fmt = _SafeOtelFormatter(
        fmt=(
            "%(asctime)s %(levelname)s [%(name)s] "
            "[trace_id=%(otelTraceID)s span_id=%(otelSpanID)s] %(message)s"
        ),
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    if not root.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(fmt)
        root.addHandler(handler)
    else:
        for handler in root.handlers:
            handler.setFormatter(fmt)


def setup_telemetry(
    service_name: str = "artha-api",
    otlp_endpoint: str | None = None,
    otlp_headers: str | None = None,
    enable_console: bool = False,
) -> None:
    """
    Initialize OpenTelemetry tracing and correlated logging.

    Args:
        service_name:    Identifies this service in the tracing backend.
        otlp_endpoint:   OTLP **HTTP** endpoint. Examples:
                         - Grafana Cloud: ``https://otlp-gateway-prod-us-east-0.grafana.net/otlp``
                         - Honeycomb:     ``https://api.honeycomb.io``
                         - SigNoz Cloud:  ``https://ingest.us.signoz.cloud:443``
                         If ``None`` and ``enable_console`` is ``False``, a
                         no-op provider is still registered so trace context
                         propagates correctly within the process.
        otlp_headers:    Comma-separated auth headers, e.g.
                         ``"Authorization=Basic <token>"`` or
                         ``"x-honeycomb-team=<api-key>"``.
        enable_console:  Print spans to stdout — useful for local debugging.
    """
    _configure_root_logger()

    resource = Resource.create({"service.name": service_name})
    provider = TracerProvider(resource=resource)

    # ── OTLP HTTP exporter (cloud providers) ──────────────────────────────
    if otlp_endpoint:
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import (  # noqa: PLC0415
            OTLPSpanExporter,
        )

        headers = _parse_headers(otlp_headers) if otlp_headers else {}
        exporter = OTLPSpanExporter(endpoint=otlp_endpoint, headers=headers)
        provider.add_span_processor(BatchSpanProcessor(exporter))
        _logger.info("OpenTelemetry: OTLP exporter → %s", otlp_endpoint)

    # ── Console exporter (local / debug) ──────────────────────────────────
    if enable_console:
        provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
        _logger.info("OpenTelemetry: Console span exporter enabled")

    trace.set_tracer_provider(provider)

    # Inject trace_id / span_id into every Python log record
    LoggingInstrumentor().instrument(set_logging_format=False)

    _logger.info(
        "OpenTelemetry: Tracing active | service=%s otlp=%s console=%s",
        service_name,
        otlp_endpoint or "disabled",
        enable_console,
    )
