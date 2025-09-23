
# app/routers/classes_completas.py
from uuid import UUID
import asyncio, logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.uml import Clase, Atributo, Metodo
from app.schemas.clase_completa import ClaseCompletaOut
from app.schemas.atributo import AtributoCreate, AtributoUpdate
from app.schemas.metodo import MetodoCreate, MetodoUpdate
from app.utils import realtime_events

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/diagrams", tags=["classes-complete"])

# ======================
# CLASES FULL
# ======================

@router.get("/classes/{class_id}/full", response_model=ClaseCompletaOut)
def get_class_full(class_id: UUID, db: Session = Depends(get_db)):
    logger.info(f"📥 GET class full -> class_id={class_id}")
    c = db.query(Clase).filter(Clase.id == class_id).one_or_none()
    if not c:
        raise HTTPException(404, "Clase no encontrada")
    return c

@router.get("/{diagram_id}/classes/full", response_model=list[ClaseCompletaOut])
def list_classes_full(diagram_id: UUID, db: Session = Depends(get_db)):
    logger.info(f"📥 LIST classes full -> diagram_id={diagram_id}")
    items = db.query(Clase).filter(Clase.diagram_id == diagram_id).all()
    return items

# ======================
# ATRIBUTOS FULL
# ======================

@router.post("/classes/{class_id}/attributes/full", response_model=ClaseCompletaOut, status_code=status.HTTP_201_CREATED)
async def create_attribute_full(class_id: UUID, body: AtributoCreate, db: Session = Depends(get_db)):
    logger.info(f"➕ CREATE attribute full -> class_id={class_id}, body={body}")
    c = db.query(Clase).filter(Clase.id == class_id).one_or_none()
    if not c:
        raise HTTPException(404, "Clase no encontrada")

    a = Atributo(nombre=body.name, tipo=body.type, requerido=bool(body.required), clase_id=c.id)
    db.add(a); db.commit(); db.refresh(a)

    asyncio.create_task(realtime_events.notify_class_updated(c.diagram_id, c))
    return c

@router.patch("/attributes/{attr_id}/full", response_model=ClaseCompletaOut)
async def update_attribute_full(attr_id: UUID, body: AtributoUpdate, db: Session = Depends(get_db)):
    logger.info(f"✏️ UPDATE attribute full -> attr_id={attr_id}, body={body}")
    a = db.query(Atributo).filter(Atributo.id == attr_id).one_or_none()
    if not a:
        raise HTTPException(404, "Atributo no encontrado")

    if body.name is not None: a.nombre = body.name
    if body.type is not None: a.tipo = body.type
    if body.required is not None: a.requerido = body.required

    db.commit(); db.refresh(a)
    c = a.clase
    asyncio.create_task(realtime_events.notify_class_updated(c.diagram_id, c))
    return c


@router.delete("/attributes/{attr_id}/full", response_model=ClaseCompletaOut)
async def delete_attribute_full(attr_id: UUID, db: Session = Depends(get_db)):
    logger.info(f"🗑️ DELETE attribute full -> attr_id={attr_id}")
    a = db.query(Atributo).filter(Atributo.id == attr_id).one_or_none()
    if not a:
        raise HTTPException(404, "Atributo no encontrado")

    c = a.clase
    db.delete(a); db.commit()
    asyncio.create_task(realtime_events.notify_class_updated(c.diagram_id, c))
    return c

# ======================
# MÉTODOS FULL
# ======================

@router.post("/classes/{class_id}/methods/full", response_model=ClaseCompletaOut, status_code=status.HTTP_201_CREATED)
async def create_method_full(class_id: UUID, body: MetodoCreate, db: Session = Depends(get_db)):
    logger.info(f"➕ CREATE method full -> class_id={class_id}, body={body}")
    c = db.query(Clase).filter(Clase.id == class_id).one_or_none()
    if not c:
        raise HTTPException(404, "Clase no encontrada")

    m = Metodo(nombre=body.name, tipo_retorno=body.return_type, clase_id=c.id)
    db.add(m); db.commit(); db.refresh(m)

    asyncio.create_task(realtime_events.notify_class_updated(c.diagram_id, c))
    return c

@router.patch("/methods/{method_id}/full", response_model=ClaseCompletaOut)
async def update_method_full(method_id: UUID, body: MetodoUpdate, db: Session = Depends(get_db)):
    logger.info(f"✏️ UPDATE method full -> method_id={method_id}, body={body}")
    m = db.query(Metodo).filter(Metodo.id == method_id).one_or_none()
    if not m:
        raise HTTPException(404, "Método no encontrado")

    if body.name is not None: m.nombre = body.name
    if body.return_type is not None: m.tipo_retorno = body.return_type

    db.commit(); db.refresh(m)
    c = m.clase
    asyncio.create_task(realtime_events.notify_class_updated(c.diagram_id, c))
    return c


@router.delete("/methods/{method_id}/full", response_model=ClaseCompletaOut)
async def delete_method_full(method_id: UUID, db: Session = Depends(get_db)):
    logger.info(f"🗑️ DELETE method full -> method_id={method_id}")
    m = db.query(Metodo).filter(Metodo.id == method_id).one_or_none()
    if not m:
        raise HTTPException(404, "Método no encontrado")

    c = m.clase
    db.delete(m); db.commit()
    asyncio.create_task(realtime_events.notify_class_updated(c.diagram_id, c))
    return c
