from tortoise import fields
from tortoise.models import Model


class Item(Model):
    id = fields.UUIDField(pk=True)
    business = fields.ForeignKeyField("models.Business", related_name="items")
    name = fields.CharField(max_length=255)
    category = fields.CharField(max_length=100, null=True)
    unit = fields.CharField(max_length=20, default="kg")
    hsn_code = fields.CharField(max_length=20, null=True)
    gst_rate = fields.FloatField(default=0.0)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "items"
