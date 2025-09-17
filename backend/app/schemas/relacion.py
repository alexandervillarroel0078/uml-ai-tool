from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from uuid import UUID

RelationType = Literal["ASSOCIATION", "AGGREGATION", "COMPOSITION", "INHERITANCE", "DEPENDENCY"]
Anchor = Literal["left", "right", "top", "bottom"]

class RelacionCreate(BaseModel):
    # nombres amigables en la API
    from_class: UUID
    to_class: UUID
    type: RelationType
    label: Optional[str] = None

    # layout/puertos por defecto
    src_anchor: Anchor = "right"
    dst_anchor: Anchor = "left"
    src_offset: int = 0
    dst_offset: int = 0
    src_lane: int = 0
    dst_lane: int = 0

    @field_validator("from_class", "to_class")
    @classmethod
    def non_empty(cls, v: UUID) -> UUID:
        if not v:
            raise ValueError("class id requerido")
        return v

    @field_validator("src_offset", "dst_offset", "src_lane", "dst_lane")
    @classmethod
    def non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("debe ser >= 0")
        return v


class RelacionUpdate(BaseModel):
    type: Optional[RelationType] = None
    label: Optional[str] = None
    src_anchor: Optional[Anchor] = None
    dst_anchor: Optional[Anchor] = None
    src_offset: Optional[int] = None
    dst_offset: Optional[int] = None
    src_lane: Optional[int] = None
    dst_lane: Optional[int] = None


class RelacionOut(BaseModel):
    id: UUID
    # mapeos desde columnas del modelo → nombres de API
    from_class: UUID = Field(alias="origen_id")
    to_class: UUID = Field(alias="destino_id")
    type: RelationType = Field(alias="tipo")
    label: Optional[str] = Field(default=None, alias="etiqueta")

    # layout/puertos
    src_anchor: Anchor
    dst_anchor: Anchor
    src_offset: int
    dst_offset: int
    src_lane: int
    dst_lane: int

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }
