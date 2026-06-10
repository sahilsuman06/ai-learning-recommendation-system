from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

# --- User Schemas ---
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["John Doe"])
    email: EmailStr = Field(..., examples=["john.doe@example.com"])

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, examples=["securepassword123"])

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr = Field(..., examples=["john.doe@example.com"])
    password: str = Field(..., examples=["securepassword123"])

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

# --- Quiz Schemas ---
class QuizSubmit(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0, description="Quiz score between 0 and 100", examples=[85.5])

class QuizResultOut(BaseModel):
    id: int
    user_id: int
    score: float
    created_at: datetime
    date: datetime


    class Config:
        from_attributes = True

# --- Recommendation Schemas ---
class RecommendationOut(BaseModel):
    id: int
    user_id: int
    recommendation_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Progress Tracking Schemas ---
class QuizStats(BaseModel):
    average_score: float
    highest_score: float
    total_quizzes: int

class ProgressOut(BaseModel):
    stats: QuizStats
    history: List[QuizResultOut]

# --- Response Schemas ---
class QuizSubmissionResponse(BaseModel):
    quiz_result: QuizResultOut
    recommendation: RecommendationOut

# --- AI Chat Tutor Schemas ---
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, examples=["Explain recursion"])

class ChatResponse(BaseModel):
    reply: str


