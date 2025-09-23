# app/schemas/clase_completa.py
from pydantic import BaseModel, Field
from typing import List
from uuid import UUID

class AtributoOut(BaseModel):
    id: UUID
    name: str = Field(alias="nombre")
    type: str = Field(alias="tipo")
    required: bool = Field(alias="requerido")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }

class MetodoOut(BaseModel):
    id: UUID
    name: str = Field(alias="nombre")
    return_type: str = Field(alias="tipo_retorno")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }

class ClaseCompletaOut(BaseModel):
    id: UUID
    name: str = Field(alias="nombre")

    # layout
    x_grid: int
    y_grid: int
    w_grid: int
    h_grid: int
    z_index: int

    # hijos
    atributos: List[AtributoOut] = []
    metodos: List[MetodoOut] = []

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }
