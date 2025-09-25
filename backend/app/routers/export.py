# app/routers/export.py
import os, json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.db import get_db
from app.models.uml import Diagram

EXPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "exports")
os.makedirs(EXPORT_DIR, exist_ok=True)

router = APIRouter(prefix="/diagrams", tags=["export"])


@router.get("/{diagram_id}/export/save")
def export_and_save(diagram_id: UUID, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(404, "Diagrama no encontrado")

    # 🔹 Generas el JSON como antes
    result = {
        "id": str(diagram.id),
        "title": diagram.title,
        "updated_at": diagram.updated_at.isoformat(),
        "classes": [],
        "relations": []
    }
    for c in diagram.classes:
        result["classes"].append({
            "id": str(c.id),
            "name": c.nombre,
            "attributes": [
                {"id": str(a.id), "name": a.nombre, "type": a.tipo, "required": a.requerido}
                for a in c.atributos
            ],
            "methods": [
                {"id": str(m.id), "name": m.nombre, "return_type": m.tipo_retorno}
                for m in c.metodos
            ]
        })
    for r in diagram.relations:
        result["relations"].append({
            "id": str(r.id),
            "from_class": str(r.origen_id),
            "to_class": str(r.destino_id),
            "type": r.tipo.value,
            "label": r.etiqueta,
            "src_anchor": r.src_anchor,
            "dst_anchor": r.dst_anchor,
            "src_mult_min": r.mult_origen_min,
            "src_mult_max": r.mult_origen_max if r.mult_origen_max is not None else "*",
            "dst_mult_min": r.mult_destino_min,
            "dst_mult_max": r.mult_destino_max if r.mult_destino_max is not None else "*"
        })

    # 🔹 Guardar en archivo
    file_path = os.path.join(EXPORT_DIR, f"{diagram.id}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    return {"message": "Exportado correctamente", "file": file_path}
