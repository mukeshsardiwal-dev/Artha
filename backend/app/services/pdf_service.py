from jinja2 import Environment, BaseLoader
from decimal import Decimal

INVOICE_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 30px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #16a34a; padding-bottom: 15px; }
  .company-name { font-size: 22px; font-weight: bold; color: #16a34a; }
  .company-detail { font-size: 11px; color: #555; margin-top: 3px; }
  .invoice-title { font-size: 18px; font-weight: bold; text-align: right; color: #1a1a1a; }
  .invoice-meta { text-align: right; font-size: 11px; color: #555; margin-top: 5px; }
  .bill-section { display: flex; justify-content: space-between; margin: 20px 0; background: #f9fafb; padding: 12px; border-radius: 6px; }
  .bill-box h4 { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; }
  .bill-box p { font-size: 12px; color: #111; margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  thead tr { background: #16a34a; color: white; }
  thead th { padding: 8px 10px; text-align: left; font-size: 11px; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  tbody td { padding: 7px 10px; font-size: 11px; border-bottom: 1px solid #e5e7eb; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 300px; }
  .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
  .totals-row.grand { font-size: 14px; font-weight: bold; color: #16a34a; border-top: 2px solid #16a34a; margin-top: 5px; padding-top: 8px; }
  .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; }
  .paid { background: #dcfce7; color: #16a34a; }
  .unpaid { background: #fee2e2; color: #dc2626; }
  .partial { background: #fef9c3; color: #ca8a04; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">{{ business.name }}</div>
      {% if business.address %}<div class="company-detail">{{ business.address }}</div>{% endif %}
      <div class="company-detail">State: {{ business.state }}</div>
      {% if business.gstin %}<div class="company-detail">GSTIN: {{ business.gstin }}</div>{% endif %}
      {% if business.phone %}<div class="company-detail">Ph: {{ business.phone }}</div>{% endif %}
    </div>
    <div>
      <div class="invoice-title">TAX INVOICE</div>
      <div class="invoice-meta">Invoice #: {{ transaction.invoice_number or "DRAFT" }}</div>
      <div class="invoice-meta">Date: {{ transaction.transaction_date }}</div>
      <div class="invoice-meta">
        <span class="status-badge {{ transaction.payment_status }}">{{ transaction.payment_status | upper }}</span>
      </div>
    </div>
  </div>

  {% if party %}
  <div class="bill-section">
    <div class="bill-box">
      <h4>Bill To</h4>
      <p><strong>{{ party.name }}</strong></p>
      {% if party.address %}<p>{{ party.address }}</p>{% endif %}
      {% if party.state %}<p>{{ party.state }}</p>{% endif %}
      {% if party.gstin %}<p>GSTIN: {{ party.gstin }}</p>{% endif %}
      {% if party.phone %}<p>Ph: {{ party.phone }}</p>{% endif %}
    </div>
    <div class="bill-box">
      <h4>Supply Details</h4>
      <p>Place of Supply: {{ party.state or business.state }}</p>
      <p>Transaction Type: {{ transaction.type | title }}</p>
    </div>
  </div>
  {% endif %}

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>HSN</th>
        <th>Qty</th>
        <th>Unit</th>
        <th class="text-right">Rate (₹)</th>
        <th class="text-right">Amount (₹)</th>
        <th>GST%</th>
        <th class="text-right">Tax (₹)</th>
      </tr>
    </thead>
    <tbody>
      {% for item in line_items %}
      <tr>
        <td>{{ loop.index }}</td>
        <td>{{ item.item_name }}</td>
        <td>{{ item.hsn_code or "—" }}</td>
        <td>{{ item.qty }}</td>
        <td>{{ item.unit }}</td>
        <td class="text-right">{{ "%.2f"|format(item.rate|float) }}</td>
        <td class="text-right">{{ "%.2f"|format(item.amount|float) }}</td>
        <td>{{ item.gst_rate }}%</td>
        <td class="text-right">
          {% if item.gst_type == "igst" %}
            IGST ₹{{ "%.2f"|format(item.igst|float) }}
          {% else %}
            CGST ₹{{ "%.2f"|format(item.cgst|float) }}<br>SGST ₹{{ "%.2f"|format(item.sgst|float) }}
          {% endif %}
        </td>
      </tr>
      {% endfor %}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>₹{{ "%.2f"|format(transaction.subtotal|float) }}</span></div>
    {% if cgst_total > 0 %}
    <div class="totals-row"><span>CGST</span><span>₹{{ "%.2f"|format(cgst_total) }}</span></div>
    <div class="totals-row"><span>SGST</span><span>₹{{ "%.2f"|format(sgst_total) }}</span></div>
    {% endif %}
    {% if igst_total > 0 %}
    <div class="totals-row"><span>IGST</span><span>₹{{ "%.2f"|format(igst_total) }}</span></div>
    {% endif %}
    <div class="totals-row grand"><span>GRAND TOTAL</span><span>₹{{ "%.2f"|format(transaction.total_amount|float) }}</span></div>
  </div>

  {% if transaction.notes %}
  <div style="margin-top: 20px; font-size: 11px; color: #555;">
    <strong>Notes:</strong> {{ transaction.notes }}
  </div>
  {% endif %}

  <div class="footer">
    This is a computer generated invoice. | Artha — Smart Accounting for Businesses
  </div>
</body>
</html>
"""


def generate_invoice_html(transaction, business, party, line_items) -> str:
    env = Environment(loader=BaseLoader())
    template = env.from_string(INVOICE_TEMPLATE)

    cgst_total = float(sum(Decimal(str(li.cgst)) for li in line_items))
    sgst_total = float(sum(Decimal(str(li.sgst)) for li in line_items))
    igst_total = float(sum(Decimal(str(li.igst)) for li in line_items))

    return template.render(
        business=business,
        transaction=transaction,
        party=party,
        line_items=line_items,
        cgst_total=cgst_total,
        sgst_total=sgst_total,
        igst_total=igst_total,
    )


async def generate_invoice_pdf(transaction, business, party, line_items) -> bytes:
    try:
        import weasyprint
        html = generate_invoice_html(transaction, business, party, line_items)
        return weasyprint.HTML(string=html).write_pdf()
    except ImportError:
        html = generate_invoice_html(transaction, business, party, line_items)
        return html.encode("utf-8")


LEDGER_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 30px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 2px solid #16a34a; padding-bottom: 14px; margin-bottom: 20px; }
  .company-name { font-size: 20px; font-weight: bold; color: #16a34a; }
  .company-detail { font-size: 11px; color: #555; margin-top: 3px; }
  .title { font-size: 17px; font-weight: bold; text-align: right; }
  .meta { font-size: 11px; color: #555; text-align: right; margin-top: 4px; }
  .party-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
               padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
  .party-name { font-size: 15px; font-weight: bold; color: #14532d; }
  .party-detail { font-size: 11px; color: #555; margin-top: 2px; }
  .balance-box { text-align: right; }
  .balance-label { font-size: 11px; color: #6b7280; }
  .balance-amount { font-size: 18px; font-weight: bold; }
  .dr { color: #dc2626; } .cr { color: #16a34a; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  thead tr { background: #14532d; color: white; }
  thead th { padding: 8px 10px; text-align: left; font-size: 11px; }
  .text-right { text-align: right; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  tbody td { padding: 7px 10px; font-size: 11px; border-bottom: 1px solid #e5e7eb; }
  tfoot td { padding: 8px 10px; font-size: 12px; font-weight: bold;
             border-top: 2px solid #14532d; background: #f0fdf4; }
  .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #9ca3af;
            border-top: 1px solid #e5e7eb; padding-top: 14px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">{{ business.name }}</div>
      {% if business.address %}<div class="company-detail">{{ business.address }}</div>{% endif %}
      <div class="company-detail">State: {{ business.state }}</div>
      {% if business.gstin %}<div class="company-detail">GSTIN: {{ business.gstin }}</div>{% endif %}
      {% if business.phone %}<div class="company-detail">Ph: {{ business.phone }}</div>{% endif %}
    </div>
    <div>
      <div class="title">PARTY LEDGER STATEMENT</div>
      <div class="meta">Period: {{ from_date }} to {{ to_date }}</div>
      <div class="meta">Generated: {{ generated_on }}</div>
    </div>
  </div>

  <div class="party-box">
    <div>
      <div class="party-name">{{ party.name }}</div>
      <div class="party-detail">{{ party.type | title }}
        {% if party.state %} · {{ party.state }}{% endif %}
        {% if party.phone %} · {{ party.phone }}{% endif %}
      </div>
      {% if party.gstin %}<div class="party-detail">GSTIN: {{ party.gstin }}</div>{% endif %}
    </div>
    <div class="balance-box">
      <div class="balance-label">Closing Balance</div>
      <div class="balance-amount {{ 'dr' if net_balance >= 0 else 'cr' }}">
        ₹{{ "{:,.0f}".format(net_balance | abs) }} {{ 'Dr' if net_balance >= 0 else 'Cr' }}
      </div>
      <div class="balance-label" style="margin-top:2px;">{{ 'You will receive' if net_balance >= 0 else 'You owe' }}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Date</th>
        <th>Description</th>
        <th class="text-right">Debit (Dr)</th>
        <th class="text-right">Credit (Cr)</th>
        <th class="text-right">Balance</th>
      </tr>
    </thead>
    <tbody>
      {% for e in entries %}
      <tr>
        <td>{{ loop.index }}</td>
        <td>{{ e.date }}</td>
        <td>{{ e.description }}</td>
        <td class="text-right dr">{% if e.entry_type == 'debit' %}₹{{ "{:,.0f}".format(e.amount) }}{% else %}—{% endif %}</td>
        <td class="text-right cr">{% if e.entry_type == 'credit' %}₹{{ "{:,.0f}".format(e.amount) }}{% else %}—{% endif %}</td>
        <td class="text-right {{ 'dr' if e.balance >= 0 else 'cr' }}">
          ₹{{ "{:,.0f}".format(e.balance | abs) }} {{ 'Dr' if e.balance >= 0 else 'Cr' }}
        </td>
      </tr>
      {% endfor %}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">Total</td>
        <td class="text-right dr">₹{{ "{:,.0f}".format(total_debit) }}</td>
        <td class="text-right cr">₹{{ "{:,.0f}".format(total_credit) }}</td>
        <td class="text-right {{ 'dr' if net_balance >= 0 else 'cr' }}">
          ₹{{ "{:,.0f}".format(net_balance | abs) }} {{ 'Dr' if net_balance >= 0 else 'Cr' }}
        </td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    Computer generated ledger statement · Artha — Smart Accounting for Businesses
  </div>
</body>
</html>
"""


def generate_ledger_html(party, business, entries: list, from_date: str, to_date: str) -> str:
    from datetime import date as date_cls
    env = Environment(loader=BaseLoader())
    template = env.from_string(LEDGER_TEMPLATE)
    net_balance = entries[-1]["balance"] if entries else 0
    total_debit = sum(e["amount"] for e in entries if e["entry_type"] == "debit")
    total_credit = sum(e["amount"] for e in entries if e["entry_type"] == "credit")
    return template.render(
        business=business,
        party=party,
        entries=entries,
        from_date=from_date,
        to_date=to_date,
        net_balance=net_balance,
        total_debit=total_debit,
        total_credit=total_credit,
        generated_on=date_cls.today().strftime("%d %b %Y"),
    )


async def generate_ledger_pdf(party, business, entries: list, from_date: str, to_date: str) -> bytes:
    html = generate_ledger_html(party, business, entries, from_date, to_date)
    try:
        import weasyprint
        return weasyprint.HTML(string=html).write_pdf()
    except ImportError:
        return html.encode("utf-8")
