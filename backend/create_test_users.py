"""
Скрипт для создания тестовых пользователей в БД.
Запуск: python create_test_users.py
"""

from app.database import SessionLocal, init_db
from app.models.user import User
from app.schemas.auth import Role
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_test_users():
    """Создаёт тестовых пользователей если их ещё нет."""

    # Инициализируем БД (создаём таблицы)
    init_db()

    db = SessionLocal()

    test_users = [
        {
            "email": "user@test.com",
            "name": "Тестовый Пользователь",
            "password": "123456",
            "role": Role.USER
        },
        {
            "email": "mod@test.com",
            "name": "Анна Модератор",
            "password": "123456",
            "role": Role.MODERATOR
        },
        {
            "email": "admin@test.com",
            "name": "Админ Системы",
            "password": "123456",
            "role": Role.ADMIN
        }
    ]

    for user_data in test_users:
        # Проверяем, существует ли пользователь
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"✓ Пользователь {user_data['email']} уже существует")
            continue

        # Создаём нового пользователя
        user = User(
            email=user_data["email"],
            name=user_data["name"],
            hashed_password=pwd_context.hash(user_data["password"]),
            role=user_data["role"]
        )
        db.add(user)
        print(f"+ Создан пользователь: {user_data['email']} ({user_data['role'].value})")

    db.commit()
    db.close()

    print("\nГотово! Тестовые пользователи созданы.")
    print("Пароль для всех: 123456")


if __name__ == "__main__":
    create_test_users()
