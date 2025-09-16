from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.uml import Diagram, Clase, Atributo, Metodo

from app.schemas.clase import ClaseCreate, ClaseUpdate, ClaseOut
from app.schemas.atributo import AtributoCreate, AtributoUpdate, AtributoOut
from app.schemas.metodo import MetodoCreate, MetodoUpdate, MetodoOut

router = APIRouter(prefix="/diagrams", tags=["classes"])

# ---------- Helpers ----------
def _get_my_diagram(db: Session, me: User, diagram_id: UUID) -> Diagram | None:
    return db.query(Diagram).filter(Diagram.id == diagram_id, Diagram.owner_id == me.id).one_or_none()

def _get_my_class(db: Session, me: User, class_id: UUID) -> Clase | None:
    # la clase debe existir y pertenecer a un diagrama del usuario
    q = (
        db.query(Clase)
        .join(Diagram, Diagram.id == Clase.diagram_id)
        .filter(Clase.id == class_id, Diagram.owner_id == me.id)
    )
    return q.one_or_none()

# ---------- Clases ----------
# http://localhost:8000/diagrams/{diagram_uuid}/classes
# {
#   "name": "Usuario"
# }
@router.post("/{diagram_id}/classes", response_model=ClaseOut, status_code=status.HTTP_201_CREATED)
def create_class(
    diagram_id: UUID,
    body: ClaseCreate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    d = _get_my_diagram(db, me, diagram_id)
    if not d:
        raise HTTPException(404, "Diagrama no encontrado")

    c = Clase(nombre=body.name, diagram_id=d.id)
    db.add(c); db.flush()  # obtenemos c.id

    # atributos iniciales opcionales? (tu schema de ClaseCreate solo trae name, así que nada aquí)
    db.commit(); db.refresh(c)
    return ClaseOut(id=c.id, name=c.nombre) 

# http://localhost:8000/diagrams/{diagram_uuid}/classes
@router.get("/{diagram_id}/classes", response_model=list[ClaseOut])
def list_classes(
    diagram_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    d = _get_my_diagram(db, me, diagram_id)
    if not d:
        raise HTTPException(404, "Diagrama no encontrado")
    items = db.query(Clase).filter(Clase.diagram_id == d.id).all()
    return [ClaseOut(id=i.id, name=i.nombre) for i in items]

# http://localhost:8000/diagrams/classes/{class_uuid}
# {
#   "name": "UsuarioRenombrado"
# }
@router.patch("/classes/{class_id}", response_model=ClaseOut)
def update_class(
    class_id: UUID,
    body: ClaseUpdate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = _get_my_class(db, me, class_id)
    if not c:
        raise HTTPException(404, "Clase no encontrada")
    if body.name is not None:
        c.nombre = body.name
    db.commit(); db.refresh(c)
    return ClaseOut(id=c.id, name=c.nombre)

# http://localhost:8000/diagrams/classes/{class_uuid}
@router.delete("/classes/{class_id}", status_code=204)
def delete_class(
    class_id: UUID,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = _get_my_class(db, me, class_id)
    if not c:
        raise HTTPException(404, "Clase no encontrada")
    db.delete(c); db.commit()
    return

# ---------- Atributos ----------
# http://localhost:8000/diagrams/classes/{class_uuid}/attributes
# {
#   "name": "email",
#   "type": "string",
#   "required": true
# }
@router.post("/classes/{class_id}/attributes", response_model=AtributoOut, status_code=status.HTTP_201_CREATED)
def create_attribute(
    class_id: UUID,
    body: AtributoCreate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = _get_my_class(db, me, class_id)
    if not c:
        raise HTTPException(404, "Clase no encontrada")

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
    c = _get_my_class(db, me, class_id)
    if not c:
        raise HTTPException(404, "Clase no encontrada")
    items = db.query(Atributo).filter(Atributo.clase_id == c.id).all()
    return [AtributoOut(id=i.id, name=i.nombre, type=i.tipo, required=i.requerido) for i in items]

@router.patch("/attributes/{attr_id}", response_model=AtributoOut)
def update_attribute(
    attr_id: UUID,
    body: AtributoUpdate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    # Validar ownership vía join: atributo -> clase -> diagrama(owner=me)
    q = (
        db.query(Atributo)
        .join(Clase, Clase.id == Atributo.clase_id)
        .join(Diagram, Diagram.id == Clase.diagram_id)
        .filter(Atributo.id == attr_id, Diagram.owner_id == me.id)
    )
    a = q.one_or_none()
    if not a:
        raise HTTPException(404, "Atributo no encontrado")

    if body.name is not None:
        a.nombre = body.name
    if body.type is not None:
        a.tipo = body.type
    if body.required is not None:
        a.requerido = bool(body.required)

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

# ---------- Métodos ----------
# http://localhost:8000/diagrams/classes/{class_uuid}/methods
# {
#   "name": "login",
#   "return_type": "bool"
# }
@router.post("/classes/{class_id}/methods", response_model=MetodoOut, status_code=status.HTTP_201_CREATED)
def create_method(
    class_id: UUID,
    body: MetodoCreate,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    c = _get_my_class(db, me, class_id)
    if not c:
        raise HTTPException(404, "Clase no encontrada")

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
    c = _get_my_class(db, me, class_id)
    if not c:
        raise HTTPException(404, "Clase no encontrada")
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

    if body.name is not None:
        m.nombre = body.name
    if body.return_type is not None:
        m.tipo_retorno = body.return_type

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
