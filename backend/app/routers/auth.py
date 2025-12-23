from fastapi import APIRouter, HTTPException
from app.schemas.auth import (
    UserCreate, UserLogin, LoginResponse, RegisterResponse, UserResponse, Role
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Временное хранилище пользователей (до подключения БД)
MOCK_USERS = {
    "user@test.com": {
        "id": 1,
        "name": "Максим Харунжин",
        "email": "user@test.com",
        "password": "123456",
        "role": Role.USER
    },
    "mod@test.com": {
        "id": 2,
        "name": "Анна Модератор",
        "email": "mod@test.com",
        "password": "123456",
        "role": Role.MODERATOR
    },
    "admin@test.com": {
        "id": 3,
        "name": "Админ Системы",
        "email": "admin@test.com",
        "password": "123456",
        "role": Role.ADMIN
    }
}

# Временное хранилище зарегистрированных пользователей
registered_users = {}


@router.post("/login", response_model=LoginResponse)
async def login(data: UserLogin):
    """
    Авторизация пользователя.
    UGC: событие входа пользователя в систему.
    """
    email = data.email.lower()

    # Проверяем в тестовых пользователях
    if email in MOCK_USERS:
        user_data = MOCK_USERS[email]
        if user_data["password"] == data.password:
            return LoginResponse(
                success=True,
                token=f"mock_token_{user_data['id']}",
                user=UserResponse(
                    id=user_data["id"],
                    email=user_data["email"],
                    name=user_data["name"],
                    role=user_data["role"]
                )
            )

    # Проверяем в зарегистрированных
    if email in registered_users:
        user_data = registered_users[email]
        if user_data["password"] == data.password:
            return LoginResponse(
                success=True,
                token=f"mock_token_{user_data['id']}",
                user=UserResponse(
                    id=user_data["id"],
                    email=user_data["email"],
                    name=user_data["name"],
                    role=user_data["role"]
                )
            )

    return LoginResponse(
        success=False,
        error="Неверный email или пароль"
    )


@router.post("/register", response_model=RegisterResponse)
async def register(data: UserCreate):
    """
    Регистрация нового пользователя.
    UGC: событие создания нового пользователя.
    """
    email = data.email.lower()

    # Проверяем, не занят ли email
    if email in MOCK_USERS or email in registered_users:
        return RegisterResponse(
            success=False,
            error="Пользователь с таким email уже существует"
        )

    # Создаём нового пользователя
    new_id = len(MOCK_USERS) + len(registered_users) + 1
    registered_users[email] = {
        "id": new_id,
        "name": data.name,
        "email": email,
        "password": data.password,
        "role": Role.USER
    }

    return RegisterResponse(
        success=True,
        user=UserResponse(
            id=new_id,
            email=email,
            name=data.name,
            role=Role.USER
        )
    )


@router.post("/logout")
async def logout():
    """
    Выход из системы.
    UGC: событие выхода пользователя.
    """
    # TODO: Реализовать инвалидацию токена в БД
    return {"success": True}
