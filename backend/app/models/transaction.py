from tortoise import fields
from tortoise.models import Model


class Transaction(Model):
    id = fields.UUIDField(pk=True)
    business = fields.ForeignKeyField("models.Business", related_name="transactions")
    party = fields.ForeignKeyField("models.Party", related_name="transactions", null=True)
    type = fields.CharField(max_length=20)  # sale | purchase
    transaction_date = fields.DateField()
    invoice_number = fields.CharField(max_length=50, null=True)
    subtotal = fields.DecimalField(max_digits=12, decimal_places=2, default=0)
    gst_amount = fields.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = fields.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = fields.CharField(max_length=20, default="unpaid")  # unpaid | partial | paid
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    line_items: fields.ReverseRelation["TransactionLineItem"]

    class Meta:
        table = "transactions"


class TransactionLineItem(Model):
    id = fields.UUIDField(pk=True)
    transaction = fields.ForeignKeyField("models.Transaction", related_name="line_items")
    item = fields.ForeignKeyField("models.Item", related_name="line_items", null=True)
    item_name = fields.CharField(max_length=255)
    hsn_code = fields.CharField(max_length=20, null=True)
    qty = fields.DecimalField(max_digits=10, decimal_places=3)
    unit = fields.CharField(max_length=20, default="kg")
    rate = fields.DecimalField(max_digits=10, decimal_places=2)
    amount = fields.DecimalField(max_digits=12, decimal_places=2)
    gst_rate = fields.FloatField(default=0.0)
    cgst = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    sgst = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    igst = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    gst_type = fields.CharField(max_length=20, default="cgst_sgst")  # cgst_sgst | igst

    class Meta:
        table = "transaction_line_items"
