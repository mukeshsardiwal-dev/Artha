from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.business import Business
from app.models.party import Party
from app.models.item import Item
from app.models.transaction import Transaction, TransactionLineItem
from app.models.cashbook import CashbookEntry
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionOut,
    LineItemOut,
)
from app.schemas.party import PartyOut
from app.deps import get_current_business
from app.services.gst import process_line_items
from decimal import Decimal
from datetime import date

router = APIRouter(prefix="/transactions", tags=["transactions"])


async def _next_invoice_number(business_id) -> str:
    from datetime import datetime

    year = datetime.utcnow().year
    last = (
        await Transaction.filter(
            business_id=business_id,
            type="sale",
            invoice_number__not_isnull=True,
        )
        .order_by("-created_at")
        .first()
    )
    if last and last.invoice_number:
        try:
            seq = int(last.invoice_number.split("-")[-1]) + 1
        except (ValueError, IndexError):
            seq = 1
    else:
        seq = 1
    return f"INV-{year}-{seq:04d}"


async def _serialize_transaction(t: Transaction) -> TransactionOut:
    line_items = await TransactionLineItem.filter(transaction_id=t.id).all()
    party = None
    if t.party_id:
        p = await Party.get_or_none(id=t.party_id)
        if p:
            party = PartyOut.model_validate(p)
    return TransactionOut(
        id=t.id,
        business_id=t.business_id,
        party_id=t.party_id,
        type=t.type,
        transaction_date=t.transaction_date,
        invoice_number=t.invoice_number,
        subtotal=t.subtotal,
        gst_amount=t.gst_amount,
        total_amount=t.total_amount,
        payment_status=t.payment_status,
        notes=t.notes,
        created_at=t.created_at,
        line_items=[LineItemOut.model_validate(li) for li in line_items],
        party=party,
    )


@router.get("", response_model=list[TransactionOut])
async def list_transactions(
    type: str | None = Query(None),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    party_id: str | None = Query(None),
    payment_status: str | None = Query(None),
    business: Business = Depends(get_current_business),
):
    qs = Transaction.filter(business_id=business.id)
    if type:
        qs = qs.filter(type=type)
    if from_date:
        qs = qs.filter(transaction_date__gte=from_date)
    if to_date:
        qs = qs.filter(transaction_date__lte=to_date)
    if party_id:
        qs = qs.filter(party_id=party_id)
    if payment_status:
        qs = qs.filter(payment_status=payment_status)
    txns = await qs.order_by("-transaction_date", "-created_at").all()
    return [await _serialize_transaction(t) for t in txns]


@router.post("", response_model=TransactionOut, status_code=201)
async def create_transaction(
    data: TransactionCreate, business: Business = Depends(get_current_business)
):
    buyer_state = None
    if data.party_id:
        party = await Party.get_or_none(id=str(data.party_id), business_id=business.id)
        if party:
            buyer_state = party.state

    processed = process_line_items(data.line_items, business.state, buyer_state)

    subtotal = sum(li["amount"] for li in processed)
    gst_amount = sum(li["cgst"] + li["sgst"] + li["igst"] for li in processed)
    total_amount = subtotal + gst_amount

    invoice_number = None
    if data.type == "sale":
        invoice_number = await _next_invoice_number(business.id)

    txn = await Transaction.create(
        business_id=business.id,
        party_id=str(data.party_id) if data.party_id else None,
        type=data.type,
        transaction_date=data.transaction_date,
        invoice_number=invoice_number,
        subtotal=subtotal,
        gst_amount=gst_amount,
        total_amount=total_amount,
        payment_status=data.payment_status,
        notes=data.notes,
    )

    for li in processed:
        await TransactionLineItem.create(
            transaction_id=txn.id,
            item_id=str(li["item_id"]) if li["item_id"] else None,
            item_name=li["item_name"],
            hsn_code=li["hsn_code"],
            qty=li["qty"],
            unit=li["unit"],
            rate=li["rate"],
            amount=li["amount"],
            gst_rate=li["gst_rate"],
            cgst=li["cgst"],
            sgst=li["sgst"],
            igst=li["igst"],
            gst_type=li["gst_type"],
        )

    if data.payment_status == "paid" and data.party_id:
        desc = f"Payment for {invoice_number or str(txn.id)}"
        cb_type = "receipt" if data.type == "sale" else "payment"
        await CashbookEntry.create(
            business_id=business.id,
            type=cb_type,
            amount=total_amount,
            description=desc,
            party_id=str(data.party_id),
            transaction_id=txn.id,
            entry_date=data.transaction_date,
        )

    return await _serialize_transaction(txn)


@router.get("/{txn_id}", response_model=TransactionOut)
async def get_transaction(
    txn_id: str, business: Business = Depends(get_current_business)
):
    txn = await Transaction.get_or_none(id=txn_id, business_id=business.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return await _serialize_transaction(txn)


@router.put("/{txn_id}", response_model=TransactionOut)
async def update_transaction(
    txn_id: str,
    data: TransactionUpdate,
    business: Business = Depends(get_current_business),
):
    txn = await Transaction.get_or_none(id=txn_id, business_id=business.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await txn.update_from_dict(update_data).save()
    return await _serialize_transaction(txn)


@router.delete("/{txn_id}", status_code=204)
async def delete_transaction(
    txn_id: str, business: Business = Depends(get_current_business)
):
    txn = await Transaction.get_or_none(id=txn_id, business_id=business.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await TransactionLineItem.filter(transaction_id=txn_id).delete()
    await CashbookEntry.filter(transaction_id=txn_id).delete()
    await txn.delete()


@router.patch("/{txn_id}/payment", response_model=TransactionOut)
async def update_payment_status(
    txn_id: str,
    payment_status: str = Query(...),
    business: Business = Depends(get_current_business),
):
    txn = await Transaction.get_or_none(id=txn_id, business_id=business.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    txn.payment_status = payment_status
    await txn.save()
    return await _serialize_transaction(txn)
