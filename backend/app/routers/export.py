import os, sys
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db import get_db
from app.models.uml import Diagram

# Apuntar siempre a la raíz del proyecto
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
EXPORT_DIR = os.path.join(PROJECT_ROOT, "exporters", "json")
os.makedirs(EXPORT_DIR, exist_ok=True)

# Importar generadores
sys.path.append(PROJECT_ROOT)
from exporters.generators.uml_to_json import export_diagram_to_json
from exporters.generators.validator import UMLValidationError

router = APIRouter(prefix="/diagrams", tags=["export"])

def build_diagram_dict(diagram: Diagram) -> dict:
    return {
        "id": str(diagram.id),
        "title": diagram.title,
        "classes": [
            {
                "id": str(c.id),
                "name": c.nombre,
                "attributes": [
                    {"name": a.nombre, "type": a.tipo, "required": a.requerido}
                    for a in c.atributos
                ],
                "methods": [
                    {"name": m.nombre, "return_type": m.tipo_retorno}
                    for m in c.metodos
                ],
            }
            for c in diagram.classes
        ],
       "relations": [
    {
        "from": r.origen.nombre,
        "from_id": str(r.origen_id),
        "to": r.destino.nombre,
        "to_id": str(r.destino_id),
        "type": r.tipo.value,
        "from_min": r.mult_origen_min,
        "from_max": r.mult_origen_max,   # null = *
        "to_min": r.mult_destino_min,
        "to_max": r.mult_destino_max,    # null = *
        "label": r.etiqueta or "",
        # "role_from": r.origen.nombre.lower(),
        # "role_to": r.destino.nombre.lower(),
        "role_from": (
            r.etiqueta if (r.mult_origen_max is None and r.mult_destino_max is None)
            else r.origen.nombre.lower()
        ),
        "role_to": (
            r.etiqueta if (r.mult_origen_max is None and r.mult_destino_max is None)
            else r.destino.nombre.lower()
        )

    }
    for r in diagram.relations
]
,
    }

@router.post("/{diagram_id}/export")
def export_diagram(diagram_id: UUID, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(404, "Diagrama no encontrado")

    diagram_dict = build_diagram_dict(diagram)
    path = os.path.join(EXPORT_DIR, f"diagram_{diagram_id}.json")

    try:
        export_diagram_to_json(diagram_dict, path)
        return {"status": "ok", "file": path}
    except UMLValidationError as e:
        raise HTTPException(status_code=400, detail=f"Error de validación UML: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")
