from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.business import Business
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate, ItemOut
from app.deps import get_current_business

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemOut])
async def list_items(
    search: str | None = Query(None),
    business: Business = Depends(get_current_business),
):
    qs = Item.filter(business_id=business.id, is_active=True)
    if search:
        qs = qs.filter(name__icontains=search)
    items = await qs.order_by("name").all()
    return [ItemOut.model_validate(i) for i in items]


@router.post("", response_model=ItemOut, status_code=201)
async def create_item(
    data: ItemCreate, business: Business = Depends(get_current_business)
):
    item = await Item.create(business_id=business.id, **data.model_dump())
    return ItemOut.model_validate(item)


@router.get("/{item_id}", response_model=ItemOut)
async def get_item(item_id: str, business: Business = Depends(get_current_business)):
    item = await Item.get_or_none(id=item_id, business_id=business.id, is_active=True)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemOut.model_validate(item)


@router.put("/{item_id}", response_model=ItemOut)
async def update_item(
    item_id: str, data: ItemUpdate, business: Business = Depends(get_current_business)
):
    item = await Item.get_or_none(id=item_id, business_id=business.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await item.update_from_dict(update_data).save()
    return ItemOut.model_validate(item)


@router.delete("/{item_id}", status_code=204)
async def delete_item(item_id: str, business: Business = Depends(get_current_business)):
    item = await Item.get_or_none(id=item_id, business_id=business.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_active = False
    await item.save()
