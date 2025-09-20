# app/routers/relacion.py
from uuid import UUID, uuid4
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.uml import Diagram, Clase, Relacion, RelType
from app.schemas.relacion import RelacionCreate, RelacionUpdate, RelacionOut
from ._helpers import get_my_diagram
from sqlalchemy.orm import aliased

router = APIRouter(prefix="/diagrams", tags=["relations"])

log = logging.getLogger("app.routers.relacion")

def _ctx(**kw) -> str:
    """Formatea contexto k=v para logs compactos."""
    return " ".join(f"{k}={v}" for k, v in kw.items() if v is not None)

def _get_class_in_my_diagram(
    db: Session, me: User, diagram_id: UUID, class_id: UUID
) -> Clase | None:
    return (
        db.query(Clase)
        .join(Diagram, Diagram.id == Clase.diagram_id)
        .filter(
            Clase.id == class_id,
            Clase.diagram_id == diagram_id,
            Diagram.owner_id == me.id,
        )
        .one_or_none()
    )






@router.post("/{diagram_id}/relations", response_model=RelacionOut, status_code=status.HTTP_201_CREATED)
def create_relation(
    diagram_id: UUID,
    body: RelacionCreate,
    request: Request,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    req_id = str(uuid4())
    log.info("create_relation.start " + _ctx(req=req_id, user_id=me.id, diagram_id=diagram_id))
    log.debug("create_relation.payload " + _ctx(
        req=req_id,
        from_class=body.from_class, to_class=body.to_class,
        type=body.type, label=body.label,
        src_anchor=body.src_anchor, dst_anchor=body.dst_anchor,
        src_offset=body.src_offset, dst_offset=body.dst_offset,
        src_lane=body.src_lane, dst_lane=body.dst_lane,
        src_mult_min=body.src_mult_min, src_mult_max=body.src_mult_max,
        dst_mult_min=body.dst_mult_min, dst_mult_max=body.dst_mult_max,
    ))
    try:
        d = get_my_diagram(db, me, diagram_id)
        log.debug("create_relation.diagram_ok " + _ctx(req=req_id, diagram_id=d.id))

        src = _get_class_in_my_diagram(db, me, d.id, body.from_class)
        dst = _get_class_in_my_diagram(db, me, d.id, body.to_class)
        log.debug("create_relation.class_lookup " + _ctx(
            req=req_id,
            src_found=bool(src), dst_found=bool(dst),
            src_id=getattr(src, "id", None), dst_id=getattr(dst, "id", None)
        ))
        if not src or not dst:
            log.warning("create_relation.class_not_found " + _ctx(
                req=req_id, src_ok=bool(src), dst_ok=bool(dst)))
            raise HTTPException(404, detail="Clase origen/destino no encontrada en el diagrama")

        r = Relacion(
            diagram_id=d.id,
            origen_id=src.id,
            destino_id=dst.id,
            tipo=RelType(body.type),
            etiqueta=body.label,
            src_anchor=body.src_anchor,
            dst_anchor=body.dst_anchor,
            src_offset=body.src_offset,
            dst_offset=body.dst_offset,
            src_lane=body.src_lane,
            dst_lane=body.dst_lane,
            mult_origen_min=body.src_mult_min,
            mult_origen_max=body.src_mult_max,
            mult_destino_min=body.dst_mult_min,
            mult_destino_max=body.dst_mult_max,
        )
        db.add(r)
        d.updated_at = func.now()
        db.commit(); db.refresh(r)
        log.info("create_relation.ok " + _ctx(
            req=req_id, relation_id=r.id, type=r.tipo.value, label=r.etiqueta))

        # ✅ Devolver con los nombres incluidos
        return RelacionOut.model_validate({
            **r.__dict__,
            "origen_nombre": src.nombre,
            "destino_nombre": dst.nombre,
        })
    except HTTPException:
        raise
    except Exception as e:
        log.exception("create_relation.error " + _ctx(req=req_id, diagram_id=diagram_id))
        raise HTTPException(500, detail="Error interno creando la relación")

@router.get("/{diagram_id}/relations", response_model=list[RelacionOut])
def list_relations(
    diagram_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    req_id = str(uuid4())
    log.info("list_relations.start " + _ctx(req=req_id, user_id=me.id, diagram_id=diagram_id))
    try:
        d = get_my_diagram(db, me, diagram_id)

        Origen = aliased(Clase)
        Destino = aliased(Clase)

        items = (
            db.query(
                Relacion,
                Origen.nombre.label("origen_nombre"),
                Destino.nombre.label("destino_nombre"),
            )
            .join(Origen, Relacion.origen_id == Origen.id)
            .join(Destino, Relacion.destino_id == Destino.id)
            .filter(Relacion.diagram_id == d.id)
            .all()
        )

        result = []
        for rel, origen_nombre, destino_nombre in items:
            data = RelacionOut.model_validate(
                {
                    **rel.__dict__,
                    "origen_nombre": origen_nombre,
                    "destino_nombre": destino_nombre,
                }
            )
            result.append(data)

        log.info("list_relations.ok " + _ctx(req=req_id, count=len(result)))
        return result
    except HTTPException:
        raise
    except Exception:
        log.exception("list_relations.error " + _ctx(req=req_id, diagram_id=diagram_id))
        raise HTTPException(500, detail="Error interno listando relaciones")



@router.patch("/relations/{relation_id}", response_model=RelacionOut)
def update_relation(
    relation_id: UUID,
    body: RelacionUpdate,
    request: Request,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    req_id = str(uuid4())
    log.info("update_relation.start " + _ctx(req=req_id, user_id=me.id, relation_id=relation_id))
    try:
        r = (
            db.query(Relacion)
            .join(Diagram, Diagram.id == Relacion.diagram_id)
            .filter(Relacion.id == relation_id, Diagram.owner_id == me.id)
            .one_or_none()
        )
        if not r:
            log.warning("update_relation.not_found " + _ctx(req=req_id, relation_id=relation_id))
            raise HTTPException(404, detail="Relación no encontrada")

        changes: dict[str, dict] = {}

        def apply(attr: str, new_val):
            old_val = getattr(r, attr)
            if new_val != old_val:   # 👈 ahora sí deja poner None
                setattr(r, attr, new_val)
                changes[attr] = {"old": old_val, "new": new_val}

        if body.type is not None:
            new_tipo = RelType(body.type)
            apply("tipo", new_tipo)

        apply("etiqueta", body.label)
        apply("src_anchor", body.src_anchor)
        apply("dst_anchor", body.dst_anchor)
        apply("src_offset", body.src_offset)
        apply("dst_offset", body.dst_offset)
        apply("src_lane", body.src_lane)
        apply("dst_lane", body.dst_lane)
        apply("mult_origen_min", body.src_mult_min)
        apply("mult_origen_max", body.src_mult_max)
        apply("mult_destino_min", body.dst_mult_min)
        apply("mult_destino_max", body.dst_mult_max)

        # Validaciones de multiplicidad
        if r.mult_origen_min is not None and r.mult_origen_min < 0:
            raise HTTPException(422, detail="multiplicidad min debe ser >= 0")
        if r.mult_destino_min is not None and r.mult_destino_min < 0:
            raise HTTPException(422, detail="multiplicidad min debe ser >= 0")
        if r.mult_origen_max is not None and r.mult_origen_min is not None and r.mult_origen_max < r.mult_origen_min:
            raise HTTPException(422, detail="src_mult_max < src_mult_min")
        if r.mult_destino_max is not None and r.mult_destino_min is not None and r.mult_destino_max < r.mult_destino_min:
            raise HTTPException(422, detail="dst_mult_max < dst_mult_min")

        r.diagram.updated_at = func.now()
        db.commit(); db.refresh(r)

        origen_nombre = db.query(Clase.nombre).filter(Clase.id == r.origen_id).scalar()
        destino_nombre = db.query(Clase.nombre).filter(Clase.id == r.destino_id).scalar()

        return RelacionOut.model_validate({
            **r.__dict__,
            "origen_nombre": origen_nombre,
            "destino_nombre": destino_nombre,
        })

    except HTTPException:
        raise
    except Exception:
        log.exception("update_relation.error " + _ctx(req=req_id, relation_id=relation_id))
        raise HTTPException(500, detail="Error interno actualizando la relación")




@router.delete("/relations/{relation_id}", status_code=204)
def delete_relation(
    relation_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    req_id = str(uuid4())
    log.info("delete_relation.start " + _ctx(req=req_id, user_id=me.id, relation_id=relation_id))
    try:
        r = (
            db.query(Relacion)
            .join(Diagram, Diagram.id == Relacion.diagram_id)
            .filter(Relacion.id == relation_id, Diagram.owner_id == me.id)
            .one_or_none()
        )
        if not r:
            log.warning("delete_relation.not_found " + _ctx(req=req_id, relation_id=relation_id))
            raise HTTPException(404, detail="Relación no encontrada")
        r.diagram.updated_at = func.now()
        db.delete(r); db.commit()
        log.info("delete_relation.ok " + _ctx(req=req_id, relation_id=relation_id))
        return
    except HTTPException:
        raise
    except Exception:
        log.exception("delete_relation.error " + _ctx(req=req_id, relation_id=relation_id))
        raise HTTPException(500, detail="Error interno eliminando la relación")





 