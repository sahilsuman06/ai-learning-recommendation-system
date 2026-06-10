from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import auth, quiz, recommendations, chat

# Create all database tables (for SQLite development setup)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Based Personalized Learning Recommendation System",
    description="A complete FastAPI backend offering student login, quiz result analysis, progress tracking, and Gemini-based personalized learning recommendation roadmaps.",
    version="1.0.0"
)

# Set up CORS middleware to allow potential frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(quiz.router)
app.include_router(recommendations.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the AI-Based Personalized Learning Recommendation System API!",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "status": "online"
    }
