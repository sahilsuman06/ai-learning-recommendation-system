import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SQLITE_DATABASE_URL: str = "sqlite:///./learning_system.db"
    JWT_SECRET: str = "4eb88c1c4554b5dfa9a8d9a4b2a8d11c8d76d49495c02b3117498c199587422f"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GOOGLE_API_KEY: str = ""

    @property
    def DATABASE_URL(self) -> str:
        return self.SQLITE_DATABASE_URL

    @property
    def SECRET_KEY(self) -> str:
        return self.JWT_SECRET

    @property
    def GEMINI_API_KEY(self) -> str:
        return self.GOOGLE_API_KEY

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
