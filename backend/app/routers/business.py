import base64
import hashlib
import hmac
import json
import os
import urllib.error
import urllib.request
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.config import settings
from app.deps import get_current_user
from app.models.business import Business
from app.models.user import User
from app.schemas.business import (
    BusinessCreate,
    BusinessOut,
    BusinessUpdate,
    PaymentVerifyRequest,
    SubscriptionOrderRequest,
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "logos")
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/svg+xml"}
MAX_SIZE = 2 * 1024 * 1024  # 2 MB

PLANS = {
    "3m": {"months": 3, "amount": 19900, "label": "3 Months"},
    "6m": {"months": 6, "amount": 34900, "label": "6 Months"},
    "12m": {"months": 12, "amount": 59900, "label": "12 Months"},
}

router = APIRouter(prefix="/business", tags=["business"])


def _razorpay_create_order(amount: int, receipt: str) -> dict:
    """Create a Razorpay order using urllib (no SDK needed)."""
    payload = json.dumps(
        {
            "amount": amount,
            "currency": "INR",
            "receipt": receipt,
        }
    ).encode()
    credentials = base64.b64encode(
        f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}".encode()
    ).decode()
    req = urllib.request.Request(
        "https://api.razorpay.com/v1/orders",
        data=payload,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:  # noqa: S310  # nosec B310
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise HTTPException(status_code=502, detail=f"Razorpay error: {body}") from e
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"Payment gateway unreachable: {str(e)}"
        ) from e


def _verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    msg = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(), msg, digestmod=hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.get("", response_model=BusinessOut)
async def get_business(current_user: User = Depends(get_current_user)):
    business = await Business.filter(user_id=current_user.id).first()
    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business profile not found. Please set up your business first.",
        )
    return BusinessOut.model_validate(business)


@router.post("", response_model=BusinessOut, status_code=201)
async def create_business(
    data: BusinessCreate, current_user: User = Depends(get_current_user)
):
    if await Business.filter(user_id=current_user.id).exists():
        raise HTTPException(
            status_code=400, detail="Business already exists. Use PUT to update."
        )
    business = await Business.create(
        user_id=current_user.id,
        subscription_status="pending",
        **data.model_dump(),
    )
    return BusinessOut.model_validate(business)


@router.put("", response_model=BusinessOut)
async def update_business(
    data: BusinessUpdate, current_user: User = Depends(get_current_user)
):
    business = await Business.filter(user_id=current_user.id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await business.update_from_dict(update_data).save()
    return BusinessOut.model_validate(business)


@router.post("/subscription/create-order")
async def create_subscription_order(
    data: SubscriptionOrderRequest,
    current_user: User = Depends(get_current_user),
):
    if data.plan not in PLANS:
        raise HTTPException(
            status_code=400, detail="Invalid plan. Choose 3m, 6m or 12m."
        )

    # Create or update business profile if name provided (first-time setup)
    business = await Business.filter(user_id=current_user.id).first()
    if not business:
        if not data.name or not data.state:
            raise HTTPException(
                status_code=400,
                detail="Business name and state are required for first-time setup.",
            )
        business = await Business.create(
            user_id=current_user.id,
            name=data.name,
            state=data.state,
            address=data.address,
            gstin=data.gstin,
            phone=data.phone,
            subscription_status="pending",
        )
    elif data.name:
        # Update profile fields if provided
        update = {
            k: v
            for k, v in {
                "name": data.name,
                "state": data.state,
                "address": data.address,
                "gstin": data.gstin,
                "phone": data.phone,
            }.items()
            if v
        }
        await business.update_from_dict(update).save()

    plan = PLANS[data.plan]
    receipt = f"sub_{business.id}_{uuid.uuid4().hex[:8]}"
    order = _razorpay_create_order(plan["amount"], receipt)

    return {
        "order_id": order["id"],
        "amount": plan["amount"],
        "currency": "INR",
        "plan": data.plan,
        "key_id": settings.RAZORPAY_KEY_ID,
        "business_name": business.name,
    }


@router.post("/subscription/verify", response_model=BusinessOut)
async def verify_subscription_payment(
    data: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
):
    if not _verify_signature(
        data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature
    ):
        raise HTTPException(
            status_code=400, detail="Payment verification failed. Invalid signature."
        )

    if data.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan.")

    business = await Business.filter(user_id=current_user.id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    months = PLANS[data.plan]["months"]
    now = datetime.now(UTC)
    # If still active, extend from current expiry
    base = (
        business.subscription_ends_at
        if (business.subscription_ends_at and business.subscription_ends_at > now)
        else now
    )

    business.subscription_status = "active"
    business.subscription_plan = data.plan
    business.subscription_ends_at = base + timedelta(days=30 * months)
    business.trial_ends_at = None
    await business.save()
    return BusinessOut.model_validate(business)


@router.post("/subscription/activate", response_model=BusinessOut)
async def activate_subscription(
    data: SubscriptionOrderRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Direct activation without payment.

    Used during development / before Razorpay is wired.
    """
    if data.plan not in PLANS:
        raise HTTPException(
            status_code=400, detail="Invalid plan. Choose 3m, 6m or 12m."
        )

    business = await Business.filter(user_id=current_user.id).first()
    if not business:
        if not data.name or not data.state:
            raise HTTPException(
                status_code=400, detail="Business name and state are required."
            )
        business = await Business.create(
            user_id=current_user.id,
            name=data.name,
            state=data.state,
            address=data.address,
            gstin=data.gstin,
            phone=data.phone,
            subscription_status="pending",
        )
    elif data.name:
        update = {
            k: v
            for k, v in {
                "name": data.name,
                "state": data.state,
                "address": data.address,
                "gstin": data.gstin,
                "phone": data.phone,
            }.items()
            if v
        }
        await business.update_from_dict(update).save()

    months = PLANS[data.plan]["months"]
    now = datetime.now(UTC)
    base = (
        business.subscription_ends_at
        if (business.subscription_ends_at and business.subscription_ends_at > now)
        else now
    )

    business.subscription_status = "active"
    business.subscription_plan = data.plan
    business.subscription_ends_at = base + timedelta(days=30 * months)
    business.trial_ends_at = None
    await business.save()
    return BusinessOut.model_validate(business)


@router.get("/subscription/plans")
async def get_plans():
    return [
        {
            "plan": key,
            "label": val["label"],
            "amount": val["amount"],
            "amount_display": f"₹{val['amount'] // 100}",
            "months": val["months"],
            "per_month": f"₹{val['amount'] // 100 // val['months']}/mo",
            "savings": _savings(key),
        }
        for key, val in PLANS.items()
    ]


def _savings(plan: str) -> str | None:
    per_month_3m = PLANS["3m"]["amount"] / 3
    if plan == "3m":
        return None
    saved = round(
        (1 - (PLANS[plan]["amount"] / PLANS[plan]["months"]) / per_month_3m) * 100
    )
    return f"Save {saved}%"


@router.post("/logo", response_model=BusinessOut)
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    business = await Business.filter(user_id=current_user.id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business profile not found.")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, detail="Only JPEG, PNG, WebP and SVG images are allowed."
        )

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Image must be smaller than 2 MB.")

    if business.logo_url:
        old_path = os.path.join(UPLOAD_DIR, os.path.basename(business.logo_url))
        if os.path.exists(old_path):
            os.remove(old_path)

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{business.id}_{uuid.uuid4().hex[:8]}.{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        f.write(contents)

    business.logo_url = f"/uploads/logos/{filename}"
    await business.save()
    return BusinessOut.model_validate(business)


@router.delete("/logo", response_model=BusinessOut)
async def delete_logo(current_user: User = Depends(get_current_user)):
    business = await Business.filter(user_id=current_user.id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business.logo_url:
        old_path = os.path.join(UPLOAD_DIR, os.path.basename(business.logo_url))
        if os.path.exists(old_path):
            os.remove(old_path)
        business.logo_url = None
        await business.save()
    return BusinessOut.model_validate(business)
