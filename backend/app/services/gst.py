from decimal import Decimal, ROUND_HALF_UP


def calculate_gst(
    seller_state: str,
    buyer_state: str | None,
    amount: Decimal,
    gst_rate: float,
) -> dict:
    """
    Returns GST breakup dict with cgst, sgst, igst, gst_type, total_gst.
    Intrastate (same state or no party state) → CGST + SGST.
    Interstate → IGST.
    """
    rate = Decimal(str(gst_rate))

    if gst_rate == 0:
        return {
            "cgst": Decimal("0"),
            "sgst": Decimal("0"),
            "igst": Decimal("0"),
            "gst_type": "cgst_sgst",
            "total_gst": Decimal("0"),
        }

    is_interstate = (
        buyer_state and seller_state.strip().lower() != buyer_state.strip().lower()
    )

    if is_interstate:
        igst = (amount * rate / Decimal("100")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        return {
            "cgst": Decimal("0"),
            "sgst": Decimal("0"),
            "igst": igst,
            "gst_type": "igst",
            "total_gst": igst,
        }
    else:
        half_rate = rate / Decimal("2")
        half = (amount * half_rate / Decimal("100")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        return {
            "cgst": half,
            "sgst": half,
            "igst": Decimal("0"),
            "gst_type": "cgst_sgst",
            "total_gst": half * 2,
        }


def process_line_items(
    line_items_in: list, seller_state: str, buyer_state: str | None
) -> list[dict]:
    """Compute full line item data including GST breakup."""
    result = []
    for li in line_items_in:
        qty = Decimal(str(li.qty))
        rate = Decimal(str(li.rate))
        amount = (qty * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        gst = calculate_gst(seller_state, buyer_state, amount, li.gst_rate)
        result.append(
            {
                "item_id": li.item_id,
                "item_name": li.item_name,
                "hsn_code": li.hsn_code,
                "qty": qty,
                "unit": li.unit,
                "rate": rate,
                "amount": amount,
                "gst_rate": li.gst_rate,
                "cgst": gst["cgst"],
                "sgst": gst["sgst"],
                "igst": gst["igst"],
                "gst_type": gst["gst_type"],
            }
        )
    return result
