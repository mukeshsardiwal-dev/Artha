import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator

VALID_GST_RATES = {0, 5, 12, 18, 28}


class ItemCreate(BaseModel):
    name: str
    category: str | None = None
    unit: str = "kg"
    hsn_code: str | None = None
    gst_rate: float = 0.0

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Item name cannot be empty")
        return v.strip()

    @field_validator("gst_rate")
    @classmethod
    def gst_rate_must_be_valid(cls, v: float) -> float:
        if v not in VALID_GST_RATES:
            raise ValueError(f"GST rate must be one of {sorted(VALID_GST_RATES)}")
        return v


class ItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    unit: str | None = None
    hsn_code: str | None = None
    gst_rate: float | None = None

    @field_validator("gst_rate")
    @classmethod
    def gst_rate_must_be_valid(cls, v: float | None) -> float | None:
        if v is not None and v not in VALID_GST_RATES:
            raise ValueError(f"GST rate must be one of {sorted(VALID_GST_RATES)}")
        return v


class ItemOut(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    name: str
    category: str | None
    unit: str
    hsn_code: str | None
    gst_rate: float
    created_at: datetime

    model_config = {"from_attributes": True}
