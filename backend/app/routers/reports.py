from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query

from app.deps import get_current_business
from app.models.business import Business
from app.models.cashbook import CashbookEntry
from app.models.transaction import Transaction, TransactionLineItem
from app.schemas.reports import DailyReport, GSTSummary, ItemStat, PartyWiseStat

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/daily", response_model=DailyReport)
async def daily_report(
    report_date: date = Query(default_factory=date.today, alias="date"),
    business: Business = Depends(get_current_business),
):
    sales = await Transaction.filter(
        business_id=business.id, type="sale", transaction_date=report_date
    ).all()
    purchases = await Transaction.filter(
        business_id=business.id, type="purchase", transaction_date=report_date
    ).all()

    total_sales = sum(Decimal(str(t.total_amount)) for t in sales)
    total_purchases = sum(Decimal(str(t.total_amount)) for t in purchases)
    gross_profit = total_sales - total_purchases

    cb_entries = await CashbookEntry.filter(business_id=business.id).all()
    opening = sum(
        Decimal(str(e.amount)) for e in cb_entries if e.type == "opening_balance"
    )
    receipts = sum(Decimal(str(e.amount)) for e in cb_entries if e.type == "receipt")
    payments = sum(Decimal(str(e.amount)) for e in cb_entries if e.type == "payment")
    cash_in_hand = opening + receipts - payments

    unpaid_sales = await Transaction.filter(
        business_id=business.id, type="sale", payment_status="unpaid"
    ).all()
    unpaid_purchases = await Transaction.filter(
        business_id=business.id, type="purchase", payment_status="unpaid"
    ).all()
    outstanding_receivable = sum(Decimal(str(t.total_amount)) for t in unpaid_sales)
    outstanding_payable = sum(Decimal(str(t.total_amount)) for t in unpaid_purchases)

    # Top items by amount for today's sales
    item_totals: dict[str, Decimal] = {}
    for t in sales:
        line_items = await TransactionLineItem.filter(transaction_id=t.id).all()
        for li in line_items:
            item_totals[li.item_name] = item_totals.get(
                li.item_name, Decimal("0")
            ) + Decimal(str(li.amount))

    sorted_items = sorted(item_totals.items(), key=lambda x: x[1], reverse=True)[:5]
    top_total = sum(v for _, v in sorted_items) or Decimal("1")
    top_items = [
        ItemStat(item_name=k, amount=v, percentage=round(float(v / top_total * 100), 1))
        for k, v in sorted_items
    ]

    return DailyReport(
        date=report_date,
        total_sales=total_sales,
        total_purchases=total_purchases,
        gross_profit=gross_profit,
        cash_in_hand=cash_in_hand,
        outstanding_receivable=outstanding_receivable,
        outstanding_payable=outstanding_payable,
        top_items=top_items,
    )


@router.get("/gst-summary", response_model=GSTSummary)
async def gst_summary(
    from_date: date = Query(...),
    to_date: date = Query(...),
    business: Business = Depends(get_current_business),
):
    sales = await Transaction.filter(
        business_id=business.id,
        type="sale",
        transaction_date__gte=from_date,
        transaction_date__lte=to_date,
    ).all()
    purchases = await Transaction.filter(
        business_id=business.id,
        type="purchase",
        transaction_date__gte=from_date,
        transaction_date__lte=to_date,
    ).all()

    async def aggregate_gst(txns):
        taxable = cgst = sgst = igst = Decimal("0")
        for t in txns:
            lines = await TransactionLineItem.filter(transaction_id=t.id).all()
            for li in lines:
                taxable += Decimal(str(li.amount))
                cgst += Decimal(str(li.cgst))
                sgst += Decimal(str(li.sgst))
                igst += Decimal(str(li.igst))
        return taxable, cgst, sgst, igst

    s_taxable, s_cgst, s_sgst, s_igst = await aggregate_gst(sales)
    p_taxable, p_cgst, p_sgst, p_igst = await aggregate_gst(purchases)

    tax_collected = s_cgst + s_sgst + s_igst
    tax_paid = p_cgst + p_sgst + p_igst

    return GSTSummary(
        from_date=from_date,
        to_date=to_date,
        total_taxable_sales=s_taxable,
        total_taxable_purchases=p_taxable,
        total_cgst_collected=s_cgst,
        total_sgst_collected=s_sgst,
        total_igst_collected=s_igst,
        total_cgst_paid=p_cgst,
        total_sgst_paid=p_sgst,
        total_igst_paid=p_igst,
        tax_collected=tax_collected,
        tax_paid=tax_paid,
        net_gst_liability=tax_collected - tax_paid,
    )


@router.get("/party-wise", response_model=list[PartyWiseStat])
async def party_wise_report(
    from_date: date = Query(...),
    to_date: date = Query(...),
    business: Business = Depends(get_current_business),
):
    from app.models.party import Party

    parties = await Party.filter(business_id=business.id, is_active=True).all()
    result = []
    for party in parties:
        sales = await Transaction.filter(
            business_id=business.id,
            party_id=party.id,
            type="sale",
            transaction_date__gte=from_date,
            transaction_date__lte=to_date,
        ).all()
        purchases = await Transaction.filter(
            business_id=business.id,
            party_id=party.id,
            type="purchase",
            transaction_date__gte=from_date,
            transaction_date__lte=to_date,
        ).all()
        total_sales = sum(Decimal(str(t.total_amount)) for t in sales)
        total_purchases = sum(Decimal(str(t.total_amount)) for t in purchases)
        unpaid_sales = sum(
            Decimal(str(t.total_amount)) for t in sales if t.payment_status != "paid"
        )
        unpaid_purchases = sum(
            Decimal(str(t.total_amount))
            for t in purchases
            if t.payment_status != "paid"
        )
        outstanding = unpaid_sales - unpaid_purchases
        if total_sales or total_purchases:
            result.append(
                PartyWiseStat(
                    party_id=str(party.id),
                    party_name=party.name,
                    total_sales=total_sales,
                    total_purchases=total_purchases,
                    outstanding=outstanding,
                )
            )
    return result
