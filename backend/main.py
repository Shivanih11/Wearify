from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import auth, clothes, tryon
from config import settings
from models.db import Base, engine

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api")
app.include_router(clothes.router, prefix="/api")
app.include_router(tryon.router, prefix="/api")

app.mount("/storage", StaticFiles(directory="storage"), name="storage")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "wearify-backend"}
