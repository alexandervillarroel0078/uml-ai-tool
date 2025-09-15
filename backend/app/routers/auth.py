from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..core.security import create_token, decode_token
from ..core.config import settings
from ..models.user import User
from ..services.users import get_user_by_email, hash_password, verify_password
from ..schemas.auth import SignUpIn, SignInIn, TokensOut

router = APIRouter(prefix="/auth", tags=["auth"])
COOKIE_NAME = "refresh_token"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", status_code=201)
def signup(data: SignUpIn, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(409, "Email already registered")
    user = User(email=data.email, name=data.name, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email}

@router.post("/signin", response_model=TokensOut)
def signin(data: SignInIn, response: Response, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    access = create_token(str(user.id), kind="access", minutes=settings.ACCESS_EXPIRE_MIN, extra={"role": user.role})
    refresh = create_token(str(user.id), kind="refresh", days=settings.REFRESH_EXPIRE_DAYS)
    response.set_cookie(COOKIE_NAME, refresh, httponly=True, secure=False, samesite="lax")
    return {"access_token": access}

@router.post("/refresh", response_model=TokensOut)
def refresh(refresh_token: str):
    payload = decode_token(refresh_token)
    if payload.get("kind") != "refresh":
        raise HTTPException(401, "Invalid token kind")
    sub = payload.get("sub")
    access = create_token(sub, kind="access", minutes=settings.ACCESS_EXPIRE_MIN)
    return {"access_token": access}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"ok": True}
