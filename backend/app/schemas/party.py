import uuid
from datetime import date, datetime

from pydantic import BaseModel


class PartyCreate(BaseModel):
    name: str
    type: str  # customer | supplier
    phone: str | None = None
    address: str | None = None
    state: str | None = None
    gstin: str | None = None


class PartyUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    phone: str | None = None
    address: str | None = None
    state: str | None = None
    gstin: str | None = None


class PartyOut(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    name: str
    type: str
    phone: str | None
    address: str | None
    state: str | None
    gstin: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class LedgerEntry(BaseModel):
    date: date
    description: str
    amount: float
    entry_type: str  # debit | credit
    balance: float
    transaction_id: uuid.UUID | None = None
