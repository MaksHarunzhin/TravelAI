"""
Роутер авторизации с хранением пользователей в SQLite.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    UserCreate, UserLogin, LoginResponse, RegisterResponse, UserResponse, Role
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Хэширование паролей через bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Хэширование пароля."""
    return pwd_context.hash(password)


@router.post("/login", response_model=LoginResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Авторизация пользователя.
    UGC: событие входа пользователя в систему.
    """
    email = data.email.lower()

    # Ищем пользователя в БД
    user = db.query(User).filter(User.email == email).first()

    if user and verify_password(data.password, user.hashed_password):
        return LoginResponse(
            success=True,
            token=f"token_{user.id}_{user.role.value}",
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                role=user.role
            )
        )

    return LoginResponse(
        success=False,
        error="Неверный email или пароль"
    )


@router.post("/register", response_model=RegisterResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """
    Регистрация нового пользователя.
    UGC: событие создания нового пользователя.
    """
    email = data.email.lower()

    # Проверяем, не занят ли email
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return RegisterResponse(
            success=False,
            error="Пользователь с таким email уже существует"
        )

    # Создаём нового пользователя с хэшированным паролем
    new_user = User(
        email=email,
        name=data.name,
        hashed_password=hash_password(data.password),
        role=Role.USER
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return RegisterResponse(
        success=True,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            role=new_user.role
        )
    )


@router.post("/logout")
def logout():
    """
    Выход из системы.
    UGC: событие выхода пользователя.
    """
    return {"success": True}
