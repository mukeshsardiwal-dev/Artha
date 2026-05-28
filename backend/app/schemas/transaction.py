from pydantic import BaseModel, field_validator, model_validator
from datetime import datetime, date
from decimal import Decimal
import uuid
from app.schemas.party import PartyOut

VALID_GST_RATES = {0, 5, 12, 18, 28}
VALID_PAYMENT_STATUSES = {"unpaid", "partial", "paid"}
VALID_TYPES = {"sale", "purchase"}


class LineItemIn(BaseModel):
    item_id: uuid.UUID | None = None
    item_name: str
    hsn_code: str | None = None
    qty: Decimal
    unit: str = "kg"
    rate: Decimal
    gst_rate: float = 0.0

    @field_validator("qty")
    @classmethod
    def qty_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

    @field_validator("rate")
    @classmethod
    def rate_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Rate must be greater than 0")
        return v

    @field_validator("gst_rate")
    @classmethod
    def gst_rate_must_be_valid(cls, v: float) -> float:
        if v not in VALID_GST_RATES:
            raise ValueError(f"GST rate must be one of {sorted(VALID_GST_RATES)}")
        return v

    @field_validator("item_name")
    @classmethod
    def item_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Item name cannot be empty")
        return v.strip()


class TransactionCreate(BaseModel):
    type: str  # sale | purchase
    party_id: uuid.UUID | None = None
    transaction_date: date
    line_items: list[LineItemIn]
    notes: str | None = None
    payment_status: str = "unpaid"

    @field_validator("type")
    @classmethod
    def type_must_be_valid(cls, v: str) -> str:
        if v not in VALID_TYPES:
            raise ValueError("Type must be 'sale' or 'purchase'")
        return v

    @field_validator("payment_status")
    @classmethod
    def payment_status_must_be_valid(cls, v: str) -> str:
        if v not in VALID_PAYMENT_STATUSES:
            raise ValueError(f"Payment status must be one of {VALID_PAYMENT_STATUSES}")
        return v

    @field_validator("line_items")
    @classmethod
    def must_have_line_items(cls, v: list) -> list:
        if not v:
            raise ValueError("At least one line item is required")
        return v


class TransactionUpdate(BaseModel):
    notes: str | None = None
    payment_status: str | None = None


class LineItemOut(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID | None
    item_name: str
    hsn_code: str | None
    qty: Decimal
    unit: str
    rate: Decimal
    amount: Decimal
    gst_rate: float
    cgst: Decimal
    sgst: Decimal
    igst: Decimal
    gst_type: str

    model_config = {"from_attributes": True}


class TransactionOut(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    party_id: uuid.UUID | None
    type: str
    transaction_date: date
    invoice_number: str | None
    subtotal: Decimal
    gst_amount: Decimal
    total_amount: Decimal
    payment_status: str
    notes: str | None
    created_at: datetime
    line_items: list[LineItemOut] = []
    party: PartyOut | None = None

    model_config = {"from_attributes": True}
