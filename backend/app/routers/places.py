from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/places", tags=["places"])


class PlaceResponse(BaseModel):
    id: int
    name: str
    category: str
    rating: float
    reviewsCount: int
    description: str
    image: str
    tags: Optional[List[str]] = None


class PlaceCreate(BaseModel):
    name: str
    category: str
    description: str
    image: str
    tags: Optional[List[str]] = None


@router.get("/", response_model=List[PlaceResponse])
async def get_places(category: Optional[str] = None, search: Optional[str] = None):
    """
    Получение списка мест.
    UGC: событие просмотра каталога мест.
    """
    # TODO: Реализовать получение из БД с фильтрацией
    return []


@router.get("/{place_id}", response_model=PlaceResponse)
async def get_place(place_id: int):
    """
    Получение информации о конкретном месте.
    UGC: событие просмотра карточки места.
    """
    # TODO: Реализовать получение из БД
    raise HTTPException(status_code=501, detail="В разработке")


@router.post("/", response_model=dict)
async def create_place(data: PlaceCreate):
    """
    Создание нового места (только admin).
    UGC: событие добавления нового места администратором.
    """
    # TODO: Реализовать сохранение в БД
    return {"success": False, "error": "В разработке"}


@router.put("/{place_id}", response_model=dict)
async def update_place(place_id: int, data: PlaceCreate):
    """
    Обновление информации о месте (только admin).
    UGC: событие редактирования места администратором.
    """
    # TODO: Реализовать обновление в БД
    return {"success": False, "error": "В разработке"}


@router.delete("/{place_id}", response_model=dict)
async def delete_place(place_id: int):
    """
    Удаление места (только admin).
    UGC: событие удаления места администратором.
    """
    # TODO: Реализовать удаление из БД
    return {"success": False, "error": "В разработке"}
