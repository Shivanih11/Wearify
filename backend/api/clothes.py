import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ai_processing.background_removal import remove_background
from api.auth import get_current_user
from config import settings
from models.db import get_db
from models.entities import ClothingItem
from models.schemas import ClothingOut

router = APIRouter(prefix="/clothes", tags=["Clothes"])


def _ensure_dirs():
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.processed_dir).mkdir(parents=True, exist_ok=True)


def current_user_from_header(authorization: str = Header(default=""), db: Session = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    return get_current_user(token, db)


@router.post("/upload", response_model=ClothingOut)
async def upload_clothing(
    file: UploadFile = File(...),
    category: str = Form(default="dress"),
    user=Depends(current_user_from_header),
    db: Session = Depends(get_db),
):
    _ensure_dirs()
    ext = Path(file.filename or "cloth.png").suffix or ".png"
    base_name = f"{uuid.uuid4().hex}"
    original_path = os.path.join(settings.upload_dir, f"{base_name}{ext}")
    processed_path = os.path.join(settings.processed_dir, f"{base_name}.png")

    content = await file.read()
    with open(original_path, "wb") as original_file:
        original_file.write(content)

    processed = remove_background(content)
    processed.save(processed_path, format="PNG")

    cloth = ClothingItem(
        user_id=user.id,
        category=category,
        original_path=original_path,
        processed_path=processed_path,
        width=processed.width,
        height=processed.height,
    )
    db.add(cloth)
    db.commit()
    db.refresh(cloth)
    return cloth


@router.get("/mine", response_model=list[ClothingOut])
def my_clothes(user=Depends(current_user_from_header), db: Session = Depends(get_db)):
    return (
        db.query(ClothingItem)
        .filter(ClothingItem.user_id == user.id)
        .order_by(ClothingItem.created_at.desc())
        .all()
    )


@router.get("/{item_id}/file")
def clothing_file(item_id: int, token: str | None = Query(default=None), authorization: str = Header(default=""), db: Session = Depends(get_db)):
    if token:
        user = get_current_user(token, db)
    elif authorization.startswith("Bearer "):
        user = get_current_user(authorization.split(" ", 1)[1], db)
    else:
        raise HTTPException(status_code=401, detail="Missing authentication")

    cloth = db.query(ClothingItem).filter(ClothingItem.id == item_id, ClothingItem.user_id == user.id).first()
    if not cloth:
        raise HTTPException(status_code=404, detail="Clothing not found")
    return FileResponse(cloth.processed_path)
