from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Wearify API"
    secret_key: str = "wearify-dev-secret"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"
    database_url: str = "postgresql+psycopg2://wearify:wearify@db:5432/wearify"
    upload_dir: str = "storage/uploaded_clothes"
    processed_dir: str = "storage/processed_clothes"
    results_dir: str = "storage/tryon_results"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
