 
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.uml import Diagram
from app.schemas.diagram import DiagramCreate, DiagramOut, DiagramList
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/diagrams", tags=["uml"])


# POST
# http://localhost:8000/diagrams
# {
#   "title": "Mi primer diagrama"
# } 
@router.post("", response_model=DiagramOut, status_code=status.HTTP_201_CREATED)
def create_diagram(body: DiagramCreate, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    d = Diagram(title=body.title, owner_id=me.id)
    db.add(d)
    db.commit()
    db.refresh(d)
    return d  # tus schemas usan from_attributes=True, así que esto mapea OK


# GET
# http://localhost:8000/diagrams?page=1&limit=20
@router.get("", response_model=DiagramList)
def list_diagrams(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    if page < 1: page = 1
    if limit < 1: limit = 20
    q = db.query(Diagram).filter(Diagram.owner_id == me.id).order_by(Diagram.updated_at.desc())
    total = q.count()
    items = q.offset((page - 1) * limit).limit(limit).all()
    return DiagramList(items=items, page=page, limit=limit, total=total)

# GET
# http://localhost:8000/diagrams/REEMPLAZA_AQUI_UUID
@router.get("/{diagram_id}", response_model=DiagramOut)
def get_diagram(diagram_id: UUID, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    d = db.query(Diagram).filter(Diagram.id == diagram_id, Diagram.owner_id == me.id).one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Diagrama no encontrado")
    return d

# DELETE
# http://localhost:8000/diagrams/REEMPLAZA_AQUI_UUID

@router.delete("/{diagram_id}", status_code=204)
def delete_diagram(diagram_id: UUID, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    d = db.query(Diagram).filter(Diagram.id == diagram_id, Diagram.owner_id == me.id).one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Diagrama no encontrado")
    db.delete(d)
    db.commit()
    return
