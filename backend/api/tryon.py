import base64
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from api.auth import get_current_user
from config import settings
from models.db import get_db
from models.entities import ClothingItem, TryOnResult
from models.schemas import TryOnCreate, TryOnOut

router = APIRouter(prefix="/tryon", tags=["TryOn"])


def current_user_from_header(authorization: str = Header(default=""), db: Session = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    return get_current_user(token, db)


@router.post("/save", response_model=TryOnOut)
def save_result(payload: TryOnCreate, user=Depends(current_user_from_header), db: Session = Depends(get_db)):
    cloth = db.query(ClothingItem).filter(ClothingItem.id == payload.clothing_id, ClothingItem.user_id == user.id).first()
    if not cloth:
        raise HTTPException(status_code=404, detail="Clothing item not found")

    Path(settings.results_dir).mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.png"
    file_path = os.path.join(settings.results_dir, filename)

    content = payload.snapshot_base64.split(",")[-1]
    with open(file_path, "wb") as out:
        out.write(base64.b64decode(content))

    result = TryOnResult(
        user_id=user.id,
        clothing_id=cloth.id,
        snapshot_path=file_path,
        confidence_score=payload.confidence_score,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("/history", response_model=list[TryOnOut])
def history(user=Depends(current_user_from_header), db: Session = Depends(get_db)):
    return db.query(TryOnResult).filter(TryOnResult.user_id == user.id).order_by(TryOnResult.created_at.desc()).all()
