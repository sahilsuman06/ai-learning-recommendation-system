from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Recommendation, User
from app.schemas import RecommendationOut
from app.security import get_current_user

router = APIRouter(tags=["Recommendations"])

@router.get("/recommendation", response_model=RecommendationOut)
def get_latest_recommendation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve the latest personalized recommendation generated for the student.
    """
    recommendation = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.id.desc()).first()

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recommendations found. Please submit a quiz first."
        )
    return recommendation

@router.get("/recommendation/history", response_model=List[RecommendationOut])
def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all historical recommendations generated for the student.
    """
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.id.desc()).all()
    
    return recommendations

