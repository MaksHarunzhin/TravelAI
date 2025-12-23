"""
Роутер администрирования пользователей.
Доступен только для пользователей с ролью ADMIN.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    Role, UserResponse, UserUpdate, UserListResponse
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


def get_current_admin(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Проверка роли текущего пользователя.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Требуется авторизация")

    try:
        # Токен формата: "token_1_admin"
        token = authorization.replace("Bearer ", "")
        parts = token.split("_")
        user_id = int(parts[1])
    except (IndexError, ValueError):
        raise HTTPException(status_code=401, detail="Неверный токен")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    if user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Доступ запрещён. Требуется роль администратора")

    return user


@router.get("/users", response_model=UserListResponse)
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Получить список всех пользователей.
    """
    users = db.query(User).all()

    return UserListResponse(
        users=[
            UserResponse(
                id=u.id,
                email=u.email,
                name=u.name,
                role=u.role
            ) for u in users
        ],
        total=len(users)
    )


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Получить данные конкретного пользователя.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role
    )


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Обновить данные пользователя (email, name, role).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Проверяем, не пытается ли админ изменить сам себя на не-админа
    if user.id == admin.id and data.role and data.role != Role.ADMIN:
        raise HTTPException(
            status_code=400,
            detail="Нельзя снять с себя роль администратора"
        )

    # Обновляем только переданные поля
    if data.email is not None:
        # Проверяем уникальность email
        existing = db.query(User).filter(
            User.email == data.email.lower(),
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email уже занят")
        user.email = data.email.lower()

    if data.name is not None:
        user.name = data.name

    if data.role is not None:
        user.role = data.role

    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role
    )


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Удалить пользователя.
    """
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить собственный аккаунт")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    db.delete(user)
    db.commit()

    return {"success": True, "message": f"Пользователь {user.email} удалён"}
