"""
TravelAI Backend - FastAPI Application
Главный файл для запуска приложения.

Запуск: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, chat, places, reviews, moderation, admin
from app.database import init_db

app = FastAPI(
    title="TravelAI API",
    description="API для диалоговой системы персонализированных рекомендаций мест отдыха",
    version="1.0.0"
)

# CORS для работы с frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(places.router)
app.include_router(reviews.router)
app.include_router(moderation.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    """Инициализация БД при запуске приложения."""
    init_db()


@app.get("/")
async def root():
    return {
        "message": "TravelAI API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}
