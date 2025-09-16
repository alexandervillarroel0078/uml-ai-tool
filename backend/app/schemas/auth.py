from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional

# ====== INPUTS ======

class SignUpIn(BaseModel):
    """Datos que envía el cliente para registrarse"""
    email: EmailStr
    name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class SignInIn(BaseModel):
    """Datos que envía el cliente para iniciar sesión"""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# ====== OUTPUTS ======

class UserOut(BaseModel):
    """Lo que devolvemos cuando pedimos datos de usuario"""
    id: int
    email: EmailStr
    name: str
    role: str
    active: bool

    model_config = {"from_attributes": True}


class TokensOut(BaseModel):
    """Tokens de acceso (login/refresh)"""
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None  # si luego agregamos refresh


class LoginResponse(BaseModel):
    """Respuesta completa al iniciar sesión"""
    tokens: TokensOut
    user: UserOut
