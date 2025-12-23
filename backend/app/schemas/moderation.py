from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Review(BaseModel):
    id: int
    user: str
    place: str
    rating: int
    text: str
    date: str


class Report(BaseModel):
    id: int
    type: str
    content: str
    reporter: str
    date: str


class UserInfo(BaseModel):
    id: int
    name: str
    email: str
    role: str


class ModerationStats(BaseModel):
    pending_reviews: int
    reports_count: int


class ReviewsListResponse(BaseModel):
    success: bool
    reviews: List[Review] = []
    error: Optional[str] = None


class ReportsListResponse(BaseModel):
    success: bool
    reports: List[Report] = []
    error: Optional[str] = None


class UsersListResponse(BaseModel):
    success: bool
    users: List[UserInfo] = []
    error: Optional[str] = None


class ModerationActionRequest(BaseModel):
    action: str  # "approve" or "reject"


class ModerationActionResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
