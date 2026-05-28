from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import Response
from app.models.business import Business
from app.models.party import Party
from app.models.transaction import Transaction
from app.models.cashbook import CashbookEntry
from app.schemas.party import PartyCreate, PartyUpdate, PartyOut, LedgerEntry
from app.deps import get_current_business
from app.services.pdf_service import generate_ledger_pdf
from decimal import Decimal
from datetime import date

router = APIRouter(prefix="/parties", tags=["parties"])


@router.get("", response_model=list[PartyOut])
async def list_parties(
    type: str | None = Query(None),
    search: str | None = Query(None),
    business: Business = Depends(get_current_business),
):
    qs = Party.filter(business_id=business.id, is_active=True)
    if type:
        qs = qs.filter(type=type)
    if search:
        qs = qs.filter(name__icontains=search)
    parties = await qs.order_by("name").all()
    return [PartyOut.model_validate(p) for p in parties]


@router.post("", response_model=PartyOut, status_code=201)
async def create_party(data: PartyCreate, business: Business = Depends(get_current_business)):
    party = await Party.create(business_id=business.id, **data.model_dump())
    return PartyOut.model_validate(party)


@router.get("/{party_id}", response_model=PartyOut)
async def get_party(party_id: str, business: Business = Depends(get_current_business)):
    party = await Party.get_or_none(id=party_id, business_id=business.id, is_active=True)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    return PartyOut.model_validate(party)


@router.put("/{party_id}", response_model=PartyOut)
async def update_party(party_id: str, data: PartyUpdate, business: Business = Depends(get_current_business)):
    party = await Party.get_or_none(id=party_id, business_id=business.id)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await party.update_from_dict(update_data).save()
    return PartyOut.model_validate(party)


@router.delete("/{party_id}", status_code=204)
async def delete_party(party_id: str, business: Business = Depends(get_current_business)):
    party = await Party.get_or_none(id=party_id, business_id=business.id)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    party.is_active = False
    await party.save()


@router.get("/{party_id}/ledger", response_model=list[LedgerEntry])
async def get_ledger(
    party_id: str,
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    business: Business = Depends(get_current_business),
):
    party = await Party.get_or_none(id=party_id, business_id=business.id)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    txn_qs = Transaction.filter(business_id=business.id, party_id=party_id)
    cb_qs = CashbookEntry.filter(business_id=business.id, party_id=party_id)
    if from_date:
        txn_qs = txn_qs.filter(transaction_date__gte=from_date)
        cb_qs = cb_qs.filter(entry_date__gte=from_date)
    if to_date:
        txn_qs = txn_qs.filter(transaction_date__lte=to_date)
        cb_qs = cb_qs.filter(entry_date__lte=to_date)

    transactions = await txn_qs.order_by("transaction_date").all()
    cashbook = await cb_qs.order_by("entry_date").all()

    entries = []
    for t in transactions:
        # For customer: sale = debit (they owe us), purchase = credit (we owe them)
        is_debit = (party.type == "customer" and t.type == "sale") or (party.type == "supplier" and t.type == "purchase")
        entries.append({
            "date": t.transaction_date,
            "description": f"{t.type.title()} — {t.invoice_number or t.id}",
            "amount": float(t.total_amount),
            "entry_type": "debit" if is_debit else "credit",
            "transaction_id": t.id,
        })

    for cb in cashbook:
        is_credit = cb.type == "receipt"
        entries.append({
            "date": cb.entry_date,
            "description": cb.description,
            "amount": float(cb.amount),
            "entry_type": "credit" if is_credit else "debit",
            "transaction_id": None,
        })

    entries.sort(key=lambda x: x["date"])

    balance = Decimal("0")
    result = []
    for e in entries:
        amt = Decimal(str(e["amount"]))
        balance += amt if e["entry_type"] == "debit" else -amt
        result.append(LedgerEntry(
            date=e["date"],
            description=e["description"],
            amount=e["amount"],
            entry_type=e["entry_type"],
            balance=float(balance),
            transaction_id=e["transaction_id"],
        ))
    return result


@router.get("/{party_id}/ledger/pdf")
async def get_ledger_pdf(
    party_id: str,
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    business: Business = Depends(get_current_business),
):
    party = await Party.get_or_none(id=party_id, business_id=business.id)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    # Reuse ledger logic
    txn_qs = Transaction.filter(business_id=business.id, party_id=party_id)
    cb_qs = CashbookEntry.filter(business_id=business.id, party_id=party_id)
    if from_date:
        txn_qs = txn_qs.filter(transaction_date__gte=from_date)
        cb_qs = cb_qs.filter(entry_date__gte=from_date)
    if to_date:
        txn_qs = txn_qs.filter(transaction_date__lte=to_date)
        cb_qs = cb_qs.filter(entry_date__lte=to_date)

    transactions = await txn_qs.order_by("transaction_date").all()
    cashbook = await cb_qs.order_by("entry_date").all()

    raw = []
    for t in transactions:
        is_debit = (party.type == "customer" and t.type == "sale") or (party.type == "supplier" and t.type == "purchase")
        raw.append({"date": t.transaction_date, "description": f"{t.type.title()} — {t.invoice_number or t.id}", "amount": float(t.total_amount), "entry_type": "debit" if is_debit else "credit"})
    for cb in cashbook:
        raw.append({"date": cb.entry_date, "description": cb.description, "amount": float(cb.amount), "entry_type": "credit" if cb.type == "receipt" else "debit"})

    raw.sort(key=lambda x: x["date"])
    balance = Decimal("0")
    entries = []
    for e in raw:
        amt = Decimal(str(e["amount"]))
        balance += amt if e["entry_type"] == "debit" else -amt
        entries.append({**e, "date": str(e["date"]), "balance": float(balance)})

    pdf_bytes = await generate_ledger_pdf(
        party, business, entries,
        from_date=str(from_date) if from_date else "—",
        to_date=str(to_date) if to_date else "—",
    )

    filename = f"ledger-{party.name.replace(' ', '-')}.pdf"
    media_type = "application/pdf" if pdf_bytes[:4] == b"%PDF" else "text/html"
    return Response(
        content=pdf_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
