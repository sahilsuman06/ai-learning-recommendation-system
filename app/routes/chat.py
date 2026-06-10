from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas import ChatRequest, ChatResponse
from app.security import get_current_user
from app.models import User
from app.services.gemini_service import gemini_service

router = APIRouter(tags=["AI Tutor Chat"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_tutor(
    chat_in: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Chat with the AI Personalized Learning Tutor.
    Requires student authentication. The tutor will personalize responses.
    """
    try:
        reply = gemini_service.chat_tutor(
            message=chat_in.message,
            user_name=current_user.name
        )
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to communicate with AI Tutor: {str(e)}"
        )
