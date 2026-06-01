import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class CashbookEntryCreate(BaseModel):
    type: str  # receipt | payment | opening_balance
    amount: Decimal
    description: str
    party_id: uuid.UUID | None = None
    entry_date: date


class CashbookEntryUpdate(BaseModel):
    type: str | None = None
    amount: Decimal | None = None
    description: str | None = None
    entry_date: date | None = None


class CashbookEntryOut(BaseModel):
    id: uuid.UUID
    type: str
    amount: Decimal
    description: str
    party_id: uuid.UUID | None
    entry_date: date
    created_at: datetime

    model_config = {"from_attributes": True}


class CashbookBalance(BaseModel):
    opening_balance: Decimal
    total_receipts: Decimal
    total_payments: Decimal
    current_balance: Decimal
