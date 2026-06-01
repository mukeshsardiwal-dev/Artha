from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import settings
from app.models.business import Business
from app.models.user import User

# auto_error=False so we can fall back to ?token= query param
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    header_token: str | None = Depends(oauth2_scheme),
    query_token: str | None = Query(None, alias="token"),
) -> User:
    # Accept token from Authorization header OR ?token= query param (for PDF downloads)
    token = header_token or query_token
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exc
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    user = await User.get_or_none(id=user_id)
    if user is None:
        raise credentials_exc
    return user


async def get_current_business(
    current_user: User = Depends(get_current_user),
) -> Business:
    business = await Business.filter(user_id=current_user.id).first()
    if business is None:
        raise HTTPException(
            status_code=404,
            detail="Business profile not found. Please set up your business first.",
        )
    return business
