from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, ConflictError, InactiveUserError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.subscription import Subscription
from app.models.user import User
from app.models.user_preference import UserPreference
from app.schemas.user import Token, UserCreate


class AuthService:
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(db: AsyncSession, payload: UserCreate) -> User:
        existing_user = await AuthService.get_user_by_email(db, payload.email)
        if existing_user is not None:
            raise ConflictError("A user with this email already exists")

        user = User(
            email=payload.email.lower(),
            full_name=payload.full_name,
            hashed_password=get_password_hash(payload.password),
        )
        db.add(user)
        await db.flush()
        db.add(Subscription(user_id=user.id))
        db.add(UserPreference(user_id=user.id))
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
        user = await AuthService.get_user_by_email(db, email)
        if user is None or not verify_password(password, user.hashed_password):
            raise AuthenticationError("Incorrect email or password")
        if not user.is_active:
            raise InactiveUserError()
        return user

    @staticmethod
    def create_tokens(user_id: int) -> Token:
        return Token(
            access_token=create_access_token({"sub": str(user_id)}),
            refresh_token=create_refresh_token({"sub": str(user_id)}),
        )
