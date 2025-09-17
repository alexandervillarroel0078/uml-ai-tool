from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.uml import Diagram, Clase, Relacion
from app.schemas.relacion import RelacionCreate, RelacionUpdate, RelacionOut
from ._helpers import get_my_diagram  # usamos el helper común

router = APIRouter(prefix="/diagrams", tags=["relations"])

def _get_class_in_my_diagram(db: Session, me: User, diagram_id: UUID, class_id: UUID) -> Clase | None:
    """
    Valida que la clase pertenezca al diagrama y que el diagrama sea del usuario.
    """
    q = (
        db.query(Clase)
        .join(Diagram, Diagram.id == Clase.diagram_id)
        .filter(
            Clase.id == class_id,
            Clase.diagram_id == diagram_id,
            Diagram.owner_id == me.id,
        )
    )
    return q.one_or_none()

# -----------------------
# CREATE
# POST /diagrams/{diagram_id}/relations
# -----------------------
@router.post("/{diagram_id}/relations", response_model=RelacionOut, status_code=status.HTTP_201_CREATED)
def create_relation(
    diagram_id: UUID,
    body: RelacionCreate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    # 1) El diagrama es mío
    d = get_my_diagram(db, me, diagram_id)

    # 2) Ambas clases existen, son del mismo diagrama y me pertenecen
    src = _get_class_in_my_diagram(db, me, d.id, body.from_class)
    dst = _get_class_in_my_diagram(db, me, d.id, body.to_class)
    if not src or not dst:
        raise HTTPException(404, "Clase origen/destino no encontrada en el diagrama")

    # 3) Crear relación
    r = Relacion(
        diagram_id=d.id,
        origen_id=src.id,
        destino_id=dst.id,
        tipo=body.type,
        etiqueta=body.label,
        src_anchor=body.src_anchor,
        dst_anchor=body.dst_anchor,
        src_offset=body.src_offset,
        dst_offset=body.dst_offset,
        src_lane=body.src_lane,
        dst_lane=body.dst_lane,
    )
    db.add(r); db.commit(); db.refresh(r)
    return r  # RelacionOut usa from_attributes/alias

# -----------------------
# LIST
# GET /diagrams/{diagram_id}/relations
# -----------------------
@router.get("/{diagram_id}/relations", response_model=list[RelacionOut])
def list_relations(
    diagram_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    d = get_my_diagram(db, me, diagram_id)
    items = db.query(Relacion).filter(Relacion.diagram_id == d.id).all()
    return items

# -----------------------
# UPDATE
# PATCH /diagrams/relations/{relation_id}
# -----------------------
@router.patch("/relations/{relation_id}", response_model=RelacionOut)
def update_relation(
    relation_id: UUID,
    body: RelacionUpdate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    # validar propiedad: relacion -> diagrama(owner=me)
    q = (
        db.query(Relacion)
        .join(Diagram, Diagram.id == Relacion.diagram_id)
        .filter(Relacion.id == relation_id, Diagram.owner_id == me.id)
    )
    r = q.one_or_none()
    if not r:
        raise HTTPException(404, "Relación no encontrada")

    # aplicar parches
    if body.type is not None:       r.tipo = body.type
    if body.label is not None:      r.etiqueta = body.label
    if body.src_anchor is not None: r.src_anchor = body.src_anchor
    if body.dst_anchor is not None: r.dst_anchor = body.dst_anchor
    if body.src_offset is not None: r.src_offset = body.src_offset
    if body.dst_offset is not None: r.dst_offset = body.dst_offset
    if body.src_lane is not None:   r.src_lane = body.src_lane
    if body.dst_lane is not None:   r.dst_lane = body.dst_lane

    db.commit(); db.refresh(r)
    return r

# -----------------------
# DELETE
# DELETE /diagrams/relations/{relation_id}
# -----------------------
@router.delete("/relations/{relation_id}", status_code=204)
def delete_relation(
    relation_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    q = (
        db.query(Relacion)
        .join(Diagram, Diagram.id == Relacion.diagram_id)
        .filter(Relacion.id == relation_id, Diagram.owner_id == me.id)
    )
    r = q.one_or_none()
    if not r:
        raise HTTPException(404, "Relación no encontrada")
    db.delete(r); db.commit()
    return
