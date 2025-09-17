#app/routers/atributos.py
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.uml import Atributo, Clase, Diagram
from app.schemas.atributo import AtributoCreate, AtributoUpdate, AtributoOut
from ._helpers import get_my_class

router = APIRouter(prefix="/diagrams", tags=["attributes"])

@router.post("/classes/{class_id}/attributes", response_model=AtributoOut, status_code=status.HTTP_201_CREATED)
def create_attribute(
    class_id: UUID,
    body: AtributoCreate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = get_my_class(db, me, class_id)
    a = Atributo(
        nombre=body.name,
        tipo=body.type,
        requerido=bool(body.required),
        clase_id=c.id,
    )
    db.add(a); db.commit(); db.refresh(a)
    return AtributoOut(id=a.id, name=a.nombre, type=a.tipo, required=a.requerido)

@router.get("/classes/{class_id}/attributes", response_model=list[AtributoOut])
def list_attributes(
    class_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = get_my_class(db, me, class_id)
    items = db.query(Atributo).filter(Atributo.clase_id == c.id).all()
    return [AtributoOut(id=i.id, name=i.nombre, type=i.tipo, required=i.requerido) for i in items]

@router.patch("/attributes/{attr_id}", response_model=AtributoOut)
def update_attribute(
    attr_id: UUID,
    body: AtributoUpdate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    q = (
        db.query(Atributo)
        .join(Clase, Clase.id == Atributo.clase_id)
        .join(Diagram, Diagram.id == Clase.diagram_id)
        .filter(Atributo.id == attr_id, Diagram.owner_id == me.id)
    )
    a = q.one_or_none()
    if not a:
        raise HTTPException(404, "Atributo no encontrado")

    if body.name is not None:     a.nombre    = body.name
    if body.type is not None:     a.tipo      = body.type
    if body.required is not None: a.requerido = bool(body.required)

    db.commit(); db.refresh(a)
    return AtributoOut(id=a.id, name=a.nombre, type=a.tipo, required=a.requerido)

@router.delete("/attributes/{attr_id}", status_code=204)
def delete_attribute(
    attr_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    q = (
        db.query(Atributo)
        .join(Clase, Clase.id == Atributo.clase_id)
        .join(Diagram, Diagram.id == Clase.diagram_id)
        .filter(Atributo.id == attr_id, Diagram.owner_id == me.id)
    )
    a = q.one_or_none()
    if not a:
        raise HTTPException(404, "Atributo no encontrado")
    db.delete(a); db.commit()
    return
