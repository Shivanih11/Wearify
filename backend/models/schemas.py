from datetime import datetime

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str

    class Config:
        from_attributes = True


class ClothingOut(BaseModel):
    id: int
    category: str
    original_path: str
    processed_path: str
    width: int
    height: int
    created_at: datetime

    class Config:
        from_attributes = True


class TryOnCreate(BaseModel):
    clothing_id: int
    snapshot_base64: str
    confidence_score: float = 0.9


class TryOnOut(BaseModel):
    id: int
    clothing_id: int
    snapshot_path: str
    confidence_score: float
    created_at: datetime

    class Config:
        from_attributes = True
