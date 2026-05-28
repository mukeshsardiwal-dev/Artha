from tortoise import fields
from tortoise.models import Model


class Business(Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="businesses")
    name = fields.CharField(max_length=255)
    address = fields.TextField(null=True)
    state = fields.CharField(max_length=100)
    gstin = fields.CharField(max_length=15, null=True)
    phone = fields.CharField(max_length=20, null=True)
    logo_url = fields.CharField(max_length=500, null=True)
    subscription_plan = fields.CharField(max_length=10, null=True)  # '3m', '6m', '12m'
    subscription_status = fields.CharField(max_length=20, default="trial")
    trial_ends_at = fields.DatetimeField(null=True)
    subscription_ends_at = fields.DatetimeField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    parties: fields.ReverseRelation["Party"]  # noqa: F821
    items: fields.ReverseRelation["Item"]  # noqa: F821
    transactions: fields.ReverseRelation["Transaction"]  # noqa: F821
    cashbook_entries: fields.ReverseRelation["CashbookEntry"]  # noqa: F821

    class Meta:
        table = "businesses"
