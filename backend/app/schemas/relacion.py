from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from uuid import UUID

RelationType = Literal["ASSOCIATION", "AGGREGATION", "COMPOSITION", "INHERITANCE", "DEPENDENCY"]

class RelacionCreate(BaseModel):
    from_class: UUID
    to_class: UUID
    type: RelationType
    label: Optional[str] = None

    @field_validator("from_class", "to_class")
    @classmethod
    def non_empty(cls, v: UUID) -> UUID:
        if not v:
            raise ValueError("class id requerido")
        return v

class RelacionUpdate(BaseModel):
    type: Optional[RelationType] = None
    label: Optional[str] = None

class RelacionOut(BaseModel):
    id: UUID
    from_class: UUID
    to_class: UUID
    type: RelationType
    label: Optional[str] = None

    model_config = {"from_attributes": True}
