from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import QuizResult, Recommendation, User
from app.schemas import QuizSubmit, QuizSubmissionResponse, ProgressOut, QuizStats
from app.security import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter(tags=["Quiz & Progress"])

@router.post("/quiz/submit", response_model=QuizSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_quiz(
    quiz_in: QuizSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a quiz score.
    Saves the score and automatically triggers a personalized AI recommendation.
    """
    # 1. Create and save Quiz Result
    db_quiz_result = QuizResult(
        user_id=current_user.id,
        score=quiz_in.score
    )
    db.add(db_quiz_result)
    db.flush()  # Flush to get the ID without committing yet

    # 2. Call Gemini API to generate personalized recommendation
    recommendation_text = gemini_service.generate_recommendation(
        score=quiz_in.score,
        user_name=current_user.name
    )

    # 3. Create and save Recommendation
    db_recommendation = Recommendation(
        user_id=current_user.id,
        recommendation_text=recommendation_text
    )
    db.add(db_recommendation)
    
    # Commit transaction
    db.commit()
    db.refresh(db_quiz_result)
    db.refresh(db_recommendation)

    return {
        "quiz_result": db_quiz_result,
        "recommendation": db_recommendation
    }

@router.get("/progress", response_model=ProgressOut)
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get student's progress including quiz history and statistics.
    """
    # Fetch quiz history sorted by ID descending
    history = db.query(QuizResult).filter(
        QuizResult.user_id == current_user.id
    ).order_by(QuizResult.id.desc()).all()


    if not history:
        stats = QuizStats(
            average_score=0.0,
            highest_score=0.0,
            total_quizzes=0
        )
        return {"stats": stats, "history": []}

    # Compute stats
    total_quizzes = len(history)
    highest_score = max(q.score for q in history)
    average_score = sum(q.score for q in history) / total_quizzes

    stats = QuizStats(
        average_score=round(average_score, 2),
        highest_score=round(highest_score, 2),
        total_quizzes=total_quizzes
    )

    return {
        "stats": stats,
        "history": history
    }
