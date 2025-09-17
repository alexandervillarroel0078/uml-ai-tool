#app/routers/metodo.py
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.uml import Metodo, Clase, Diagram
from app.schemas.metodo import MetodoCreate, MetodoUpdate, MetodoOut
from ._helpers import get_my_class

router = APIRouter(prefix="/diagrams", tags=["methods"])

@router.post("/classes/{class_id}/methods", response_model=MetodoOut, status_code=status.HTTP_201_CREATED)
def create_method(
    class_id: UUID,
    body: MetodoCreate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = get_my_class(db, me, class_id)
    m = Metodo(
        nombre=body.name,
        tipo_retorno=body.return_type or "void",
        clase_id=c.id,
    )
    db.add(m); db.commit(); db.refresh(m)
    return MetodoOut(id=m.id, name=m.nombre, return_type=m.tipo_retorno)

@router.get("/classes/{class_id}/methods", response_model=list[MetodoOut])
def list_methods(
    class_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = get_my_class(db, me, class_id)
    items = db.query(Metodo).filter(Metodo.clase_id == c.id).all()
    return [MetodoOut(id=i.id, name=i.nombre, return_type=i.tipo_retorno) for i in items]

@router.patch("/methods/{method_id}", response_model=MetodoOut)
def update_method(
    method_id: UUID,
    body: MetodoUpdate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    q = (
        db.query(Metodo)
        .join(Clase, Clase.id == Metodo.clase_id)
        .join(Diagram, Diagram.id == Clase.diagram_id)
        .filter(Metodo.id == method_id, Diagram.owner_id == me.id)
    )
    m = q.one_or_none()
    if not m:
        raise HTTPException(404, "Método no encontrado")

    if body.name is not None:         m.nombre = body.name
    if body.return_type is not None:  m.tipo_retorno = body.return_type

    db.commit(); db.refresh(m)
    return MetodoOut(id=m.id, name=m.nombre, return_type=m.tipo_retorno)

@router.delete("/methods/{method_id}", status_code=204)
def delete_method(
    method_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    q = (
        db.query(Metodo)
        .join(Clase, Clase.id == Metodo.clase_id)
        .join(Diagram, Diagram.id == Clase.diagram_id)
        .filter(Metodo.id == method_id, Diagram.owner_id == me.id)
    )
    m = q.one_or_none()
    if not m:
        raise HTTPException(404, "Método no encontrado")
    db.delete(m); db.commit()
    return
