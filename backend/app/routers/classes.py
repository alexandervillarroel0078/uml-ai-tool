#app/routers/classes.py
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.uml import Clase
from app.schemas.clase import ClaseCreate, ClaseUpdate, ClaseOut
from ._helpers import get_my_diagram, get_my_class

router = APIRouter(prefix="/diagrams", tags=["classes"])

@router.post("/{diagram_id}/classes", response_model=ClaseOut, status_code=status.HTTP_201_CREATED)
def create_class(
    diagram_id: UUID,
    body: ClaseCreate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    d = get_my_diagram(db, me, diagram_id)
    c = Clase(
        nombre=body.name,
        diagram_id=d.id,
        # opcionales de layout si vienen:
        x_grid=body.x_grid or 0,
        y_grid=body.y_grid or 0,
        w_grid=body.w_grid or 12,
        h_grid=body.h_grid or 6,
        z_index=body.z_index or 0,
    )
    db.add(c); db.commit(); db.refresh(c)
    return c  # ClaseOut usa alias para mapear nombre->name y trae layout

@router.get("/{diagram_id}/classes", response_model=list[ClaseOut])
def list_classes(
    diagram_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    d = get_my_diagram(db, me, diagram_id)
    items = db.query(Clase).filter(Clase.diagram_id == d.id).all()
    return items

@router.patch("/classes/{class_id}", response_model=ClaseOut)
def update_class(
    class_id: UUID,
    body: ClaseUpdate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = get_my_class(db, me, class_id)
    if body.name is not None:    c.nombre  = body.name
    if body.x_grid is not None:  c.x_grid  = body.x_grid
    if body.y_grid is not None:  c.y_grid  = body.y_grid
    if body.w_grid is not None:  c.w_grid  = body.w_grid
    if body.h_grid is not None:  c.h_grid  = body.h_grid
    if body.z_index is not None: c.z_index = body.z_index
    db.commit(); db.refresh(c)
    return c

@router.delete("/classes/{class_id}", status_code=204)
def delete_class(
    class_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = get_my_class(db, me, class_id)
    db.delete(c); db.commit()
    return
