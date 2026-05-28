from tortoise import fields
from tortoise.models import Model


class Party(Model):
    id = fields.UUIDField(pk=True)
    business = fields.ForeignKeyField("models.Business", related_name="parties")
    name = fields.CharField(max_length=255)
    type = fields.CharField(max_length=20)  # customer | supplier
    phone = fields.CharField(max_length=20, null=True)
    address = fields.TextField(null=True)
    state = fields.CharField(max_length=100, null=True)
    gstin = fields.CharField(max_length=15, null=True)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    transactions: fields.ReverseRelation["Transaction"]  # noqa: F821
    cashbook_entries: fields.ReverseRelation["CashbookEntry"]  # noqa: F821

    class Meta:
        table = "parties"
