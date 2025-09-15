from pydantic import BaseModel, EmailStr

class SignUpIn(BaseModel):
    email: EmailStr
    name: str
    password: str

class SignInIn(BaseModel):
    email: EmailStr
    password: str

class TokensOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
