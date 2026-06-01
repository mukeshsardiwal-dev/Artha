from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class ItemStat(BaseModel):
    item_name: str
    amount: Decimal
    percentage: float


class DailyReport(BaseModel):
    date: date
    total_sales: Decimal
    total_purchases: Decimal
    gross_profit: Decimal
    cash_in_hand: Decimal
    outstanding_receivable: Decimal
    outstanding_payable: Decimal
    top_items: list[ItemStat]


class GSTSummary(BaseModel):
    from_date: date
    to_date: date
    total_taxable_sales: Decimal
    total_taxable_purchases: Decimal
    total_cgst_collected: Decimal
    total_sgst_collected: Decimal
    total_igst_collected: Decimal
    total_cgst_paid: Decimal
    total_sgst_paid: Decimal
    total_igst_paid: Decimal
    tax_collected: Decimal
    tax_paid: Decimal
    net_gst_liability: Decimal


class PartyWiseStat(BaseModel):
    party_id: str
    party_name: str
    total_sales: Decimal
    total_purchases: Decimal
    outstanding: Decimal
