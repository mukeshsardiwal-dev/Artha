from tortoise import fields
from tortoise.models import Model


class CashbookEntry(Model):
    id = fields.UUIDField(pk=True)
    business = fields.ForeignKeyField("models.Business", related_name="cashbook_entries")
    type = fields.CharField(max_length=20)  # receipt | payment | opening_balance
    amount = fields.DecimalField(max_digits=12, decimal_places=2)
    description = fields.CharField(max_length=500)
    party = fields.ForeignKeyField("models.Party", related_name="cashbook_entries", null=True)
    transaction = fields.ForeignKeyField("models.Transaction", related_name="cashbook_entries", null=True)
    entry_date = fields.DateField()
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "cashbook_entries"
