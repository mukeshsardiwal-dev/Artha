from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from app.models.business import Business
from app.models.party import Party
from app.models.transaction import Transaction, TransactionLineItem
from app.services.pdf_service import generate_invoice_pdf
from app.deps import get_current_business

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("/{txn_id}/pdf")
async def get_invoice_pdf(txn_id: str, business: Business = Depends(get_current_business)):
    txn = await Transaction.get_or_none(id=txn_id, business_id=business.id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    party = None
    if txn.party_id:
        party = await Party.get_or_none(id=txn.party_id)

    line_items = await TransactionLineItem.filter(transaction_id=txn_id).all()

    pdf_bytes = await generate_invoice_pdf(txn, business, party, line_items)

    filename = f"invoice-{txn.invoice_number or txn_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
