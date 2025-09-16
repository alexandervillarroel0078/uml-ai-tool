from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ClaseCreate(BaseModel):
    name: str  # nombre de la clase

class ClaseUpdate(BaseModel):
    name: Optional[str] = None

class ClaseOut(BaseModel):
    id: UUID
    name: str

    model_config = {"from_attributes": True}
