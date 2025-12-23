from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/history", response_model=List[ChatMessage])
async def get_chat_history():
    """
    Получение истории сообщений пользователя.
    UGC: запрос истории диалога.
    """
    # TODO: Реализовать получение из БД
    return []


@router.post("/message", response_model=ChatResponse)
async def send_message(data: ChatRequest):
    """
    Отправка сообщения в чат.
    UGC: событие отправки сообщения пользователем.
    """
    # TODO: Реализовать интеграцию с LLM и сохранение в БД
    return ChatResponse(
        success=False,
        error="В разработке"
    )


@router.delete("/history")
async def clear_history():
    """
    Очистка истории чата.
    UGC: событие очистки диалога пользователем.
    """
    # TODO: Реализовать очистку в БД
    return {"success": False, "error": "В разработке"}
