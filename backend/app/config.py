from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgres://postgres:password@localhost:5432/artha"
    SECRET_KEY: str = "dev-secret-key-change-in-production"  # noqa: S105
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RAZORPAY_KEY_ID: str = "rzp_test_XXXXXXXXXXXXXXXX"
    RAZORPAY_KEY_SECRET: str = "XXXXXXXXXXXXXXXXXXXXXXXX"  # noqa: S105
    # Comma-separated list of allowed frontend origins
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ── OpenTelemetry ──────────────────────────────────────────────────────
    # Name shown in your tracing backend (Grafana, Honeycomb, SigNoz, etc.)
    OTEL_SERVICE_NAME: str = "artha-api"
    # OTLP HTTP endpoint — leave empty to disable remote export
    # Examples:
    #   Grafana Cloud : https://otlp-gateway-prod-us-east-0.grafana.net/otlp
    #   Honeycomb     : https://api.honeycomb.io
    #   SigNoz Cloud  : https://ingest.us.signoz.cloud:443
    OTEL_EXPORTER_OTLP_ENDPOINT: str | None = None
    # Comma-separated auth headers: "Authorization=Basic <token>"
    # or "x-honeycomb-team=<api-key>"
    OTEL_EXPORTER_OTLP_HEADERS: str | None = None
    # Set to true to also print spans to stdout (local debugging)
    OTEL_CONSOLE: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def origins_list(self) -> list[str]:
        # Browsers send the Origin header without a trailing slash, so strip any
        # trailing slashes here to keep CMS matching exact regardless of config.
        return [
            o.strip().rstrip("/") for o in self.ALLOWED_ORIGINS.split(",") if o.strip()
        ]


settings = Settings()

TORTOISE_ORM = {
    "connections": {"default": settings.DATABASE_URL},
    "apps": {
        "models": {
            "models": [
                "app.models.user",
                "app.models.business",
                "app.models.party",
                "app.models.item",
                "app.models.transaction",
                "app.models.cashbook",
                "aerich.models",
            ],
            "default_connection": "default",
        }
    },
}
