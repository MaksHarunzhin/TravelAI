from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Place(BaseModel):
    name: str
    category: str
    rating: float
    reviewsCount: int
    description: str
    image: str
    tags: Optional[List[str]] = None


class ChatMessage(BaseModel):
    id: int
    text: str
    isUser: bool
    time: str
    places: Optional[List[Place]] = None


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    success: bool
    message: Optional[ChatMessage] = None
    error: Optional[str] = None
