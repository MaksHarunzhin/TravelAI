from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    place_id: int
    rating: int
    text: str


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    place_id: int
    place_name: str
    rating: int
    text: str
    date: str
    status: str  # pending, approved, rejected


@router.get("/", response_model=List[ReviewResponse])
async def get_reviews(place_id: Optional[int] = None):
    """
    Получение отзывов (опционально по месту).
    UGC: событие просмотра отзывов.
    """
    # TODO: Реализовать получение из БД
    return []


@router.post("/", response_model=dict)
async def create_review(data: ReviewCreate):
    """
    Создание нового отзыва.
    UGC: событие публикации отзыва пользователем.
    """
    # TODO: Реализовать сохранение в БД (со статусом pending)
    return {"success": False, "error": "В разработке"}


@router.delete("/{review_id}", response_model=dict)
async def delete_review(review_id: int):
    """
    Удаление отзыва (автор или модератор).
    UGC: событие удаления отзыва.
    """
    # TODO: Реализовать удаление из БД
    return {"success": False, "error": "В разработке"}


@router.post("/{review_id}/report", response_model=dict)
async def report_review(review_id: int, reason: str):
    """
    Жалоба на отзыв.
    UGC: событие отправки жалобы на отзыв.
    """
    # TODO: Реализовать создание жалобы в БД
    return {"success": False, "error": "В разработке"}
