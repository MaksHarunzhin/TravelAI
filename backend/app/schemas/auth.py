from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class Role(str, Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: Role


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class LoginResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    token: Optional[str] = None
    user: Optional[UserResponse] = None


class RegisterResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    user: Optional[UserResponse] = None


class UserUpdate(BaseModel):
    """Схема для обновления данных пользователя администратором."""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[Role] = None


class UserListResponse(BaseModel):
    """Список пользователей."""
    users: list[UserResponse]
    total: int
