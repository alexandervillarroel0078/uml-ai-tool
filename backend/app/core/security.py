from datetime import datetime, timedelta, timezone
from jose import jwt
from typing import Any, Dict
from .config import settings

def create_token(subject: str, kind: str, minutes: int | None = None, days: int | None = None, extra: Dict[str, Any] | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": subject, "kind": kind, "iat": int(now.timestamp())}
    if minutes:
        payload["exp"] = int((now + timedelta(minutes=minutes)).timestamp())
    if days:
        payload["exp"] = int((now + timedelta(days=days)).timestamp())
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
