import uuid
from datetime import datetime

from pydantic import BaseModel


class BusinessCreate(BaseModel):
    name: str
    address: str | None = None
    state: str
    gstin: str | None = None
    phone: str | None = None


class BusinessUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    state: str | None = None
    gstin: str | None = None
    phone: str | None = None


class SubscriptionOrderRequest(BaseModel):
    plan: str  # '3m', '6m', '12m'
    # Business fields (only needed for first-time setup)
    name: str | None = None
    state: str | None = None
    address: str | None = None
    gstin: str | None = None
    phone: str | None = None


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: str


class BusinessOut(BaseModel):
    id: uuid.UUID
    name: str
    address: str | None
    state: str
    gstin: str | None
    phone: str | None
    logo_url: str | None
    subscription_plan: str | None
    subscription_status: str
    trial_ends_at: datetime | None
    subscription_ends_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
