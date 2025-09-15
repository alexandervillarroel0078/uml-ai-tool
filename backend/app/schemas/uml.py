from pydantic import BaseModel
from typing import List

class AtributoIn(BaseModel):
    nombre: str
    tipo: str = "string"
    requerido: bool = False

class ClaseIn(BaseModel):
    nombre: str
    atributos: List[AtributoIn] = []

class ClaseOut(ClaseIn):
    id: int
    class Config:
        from_attributes = True
