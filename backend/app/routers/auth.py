from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from passlib.context import CryptContext

from app.config import settings
from app.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(data: RegisterRequest):
    if await User.filter(email=data.email).exists():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await User.create(
        email=data.email,
        hashed_password=pwd_context.hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
    )
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user = await User.get_or_none(email=data.email)
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.put("/me", response_model=UserOut)
async def update_profile(
    data: UpdateProfileRequest, current_user: User = Depends(get_current_user)
):
    if data.email and data.email != current_user.email:
        if await User.filter(email=data.email).exclude(id=current_user.id).exists():
            raise HTTPException(
                status_code=400, detail="Email already in use by another account"
            )
        current_user.email = data.email
    if data.full_name is not None:
        if not data.full_name.strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        current_user.full_name = data.full_name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip() or None
    await current_user.save()
    return UserOut.model_validate(current_user)


@router.put("/me/password", response_model=UserOut)
async def change_password(
    data: ChangePasswordRequest, current_user: User = Depends(get_current_user)
):
    if not pwd_context.verify(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=400, detail="New password must be at least 6 characters"
        )
    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the current one",
        )
    current_user.hashed_password = pwd_context.hash(data.new_password)
    await current_user.save()
    return UserOut.model_validate(current_user)
