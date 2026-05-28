from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.business import Business
from app.models.cashbook import CashbookEntry
from app.schemas.cashbook import CashbookEntryCreate, CashbookEntryUpdate, CashbookEntryOut, CashbookBalance
from app.deps import get_current_business
from decimal import Decimal
from datetime import date

router = APIRouter(prefix="/cashbook", tags=["cashbook"])


@router.get("", response_model=list[CashbookEntryOut])
async def list_entries(
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    business: Business = Depends(get_current_business),
):
    qs = CashbookEntry.filter(business_id=business.id)
    if from_date:
        qs = qs.filter(entry_date__gte=from_date)
    if to_date:
        qs = qs.filter(entry_date__lte=to_date)
    entries = await qs.order_by("-entry_date").all()
    return [CashbookEntryOut.model_validate(e) for e in entries]


@router.get("/balance", response_model=CashbookBalance)
async def get_balance(business: Business = Depends(get_current_business)):
    entries = await CashbookEntry.filter(business_id=business.id).all()
    opening = sum(Decimal(str(e.amount)) for e in entries if e.type == "opening_balance")
    receipts = sum(Decimal(str(e.amount)) for e in entries if e.type == "receipt")
    payments = sum(Decimal(str(e.amount)) for e in entries if e.type == "payment")
    return CashbookBalance(
        opening_balance=opening,
        total_receipts=receipts,
        total_payments=payments,
        current_balance=opening + receipts - payments,
    )


@router.post("/entries", response_model=CashbookEntryOut, status_code=201)
async def create_entry(data: CashbookEntryCreate, business: Business = Depends(get_current_business)):
    entry = await CashbookEntry.create(
        business_id=business.id,
        party_id=str(data.party_id) if data.party_id else None,
        **{k: v for k, v in data.model_dump().items() if k != "party_id"},
    )
    return CashbookEntryOut.model_validate(entry)


@router.put("/entries/{entry_id}", response_model=CashbookEntryOut)
async def update_entry(entry_id: str, data: CashbookEntryUpdate, business: Business = Depends(get_current_business)):
    entry = await CashbookEntry.get_or_none(id=entry_id, business_id=business.id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await entry.update_from_dict(update_data).save()
    return CashbookEntryOut.model_validate(entry)


@router.delete("/entries/{entry_id}", status_code=204)
async def delete_entry(entry_id: str, business: Business = Depends(get_current_business)):
    entry = await CashbookEntry.get_or_none(id=entry_id, business_id=business.id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await entry.delete()
