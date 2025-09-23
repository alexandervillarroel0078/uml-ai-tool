 
# app/utils/realtime_events.py
from uuid import UUID
from app.ws_manager import ws_manager
from app.models.uml import Clase, Atributo, Metodo, Relacion


# =========================
# Clases
# =========================
async def notify_class_created(diagram_id: UUID, clase: Clase):
    payload = {
        "event": "class.created",
        "data": {
            "id": str(clase.id),
            "nombre": clase.nombre,
            "x_grid": clase.x_grid,
            "y_grid": clase.y_grid,
            "w_grid": clase.w_grid,
            "h_grid": clase.h_grid,
            "z_index": clase.z_index,
        },
    }
    print("🔔 Evento emitido (Clase Creada):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


async def notify_class_updated(diagram_id: UUID, clase: Clase):
    payload = {
        "event": "class.updated",
        "data": {
            "id": str(clase.id),
            "nombre": clase.nombre,
            "x_grid": clase.x_grid,
            "y_grid": clase.y_grid,
            "w_grid": clase.w_grid,
            "h_grid": clase.h_grid,
            "z_index": clase.z_index,
        },
    }
    print("🔔 Evento emitido (Clase Actualizada):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


async def notify_class_deleted(diagram_id: UUID, class_id: UUID):
    payload = {
        "event": "class.deleted",
        "data": {"id": str(class_id)},
    }
    print("🔔 Evento emitido (Clase Eliminada):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


# =========================
# Atributos
# =========================
async def notify_attribute_created(diagram_id: UUID, atributo: Atributo):
    payload = {
        "event": "attribute.created",
        "data": {
            "id": str(atributo.id),
            "nombre": atributo.nombre,
            "tipo": atributo.tipo,
            "requerido": atributo.requerido,
            "clase_id": str(atributo.clase_id),
        },
    }
    print("🔔 Evento emitido (Atributo Creado):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


async def notify_attribute_updated(diagram_id: UUID, atributo: Atributo):
    payload = {
        "event": "attribute.updated",
        "data": {
            "id": str(atributo.id),
            "nombre": atributo.nombre,
            "tipo": atributo.tipo,
            "requerido": atributo.requerido,
            "clase_id": str(atributo.clase_id),
        },
    }
    print("🔔 Evento emitido (Atributo Actualizado):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


async def notify_attribute_deleted(diagram_id: UUID, atributo_id: UUID):
    payload = {
        "event": "attribute.deleted",
        "data": {"id": str(atributo_id)},
    }
    print("🔔 Evento emitido (Atributo Eliminado):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


# =========================
# Métodos
# =========================
async def notify_method_created(diagram_id: UUID, metodo: Metodo):
    payload = {
        "event": "method.created",
        "data": {
            "id": str(metodo.id),
            "nombre": metodo.nombre,
            "tipo_retorno": metodo.tipo_retorno,
            "clase_id": str(metodo.clase_id),
        },
    }
    print("🔔 Evento emitido (Método Creado):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


async def notify_method_updated(diagram_id: UUID, metodo: Metodo):
    payload = {
        "event": "method.updated",
        "data": {
            "id": str(metodo.id),
            "nombre": metodo.nombre,
            "tipo_retorno": metodo.tipo_retorno,
            "clase_id": str(metodo.clase_id),
        },
    }
    print("🔔 Evento emitido (Método Actualizado):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


async def notify_method_deleted(diagram_id: UUID, metodo_id: UUID):
    payload = {
        "event": "method.deleted",
        "data": {"id": str(metodo_id)},
    }
    print("🔔 Evento emitido (Método Eliminado):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


# =========================
# Relaciones
# =========================
async def notify_relation_created(diagram_id: UUID, relation: Relacion):
    payload = {
        "event": "relation.created",
        "data": {
            "id": str(relation.id),
            "etiqueta": relation.etiqueta,
            "tipo": relation.tipo.value,
            "origen_id": str(relation.origen_id),
            "destino_id": str(relation.destino_id),
            "src_anchor": relation.src_anchor,
            "dst_anchor": relation.dst_anchor,
            "mult_origen_min": relation.mult_origen_min,
            "mult_origen_max": relation.mult_origen_max,
            "mult_destino_min": relation.mult_destino_min,
            "mult_destino_max": relation.mult_destino_max,
        },
    }
    print("🔔 Evento emitido (Relación Creada):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


async def notify_relation_updated(diagram_id: UUID, relation: Relacion):
    payload = {
        "event": "relation.updated",
        "data": {
            "id": str(relation.id),
            "etiqueta": relation.etiqueta,
            "tipo": relation.tipo.value,
            "mult_origen_min": relation.mult_origen_min,
            "mult_origen_max": relation.mult_origen_max,
            "mult_destino_min": relation.mult_destino_min,
            "mult_destino_max": relation.mult_destino_max,
        },
    }
    print("🔔 Evento emitido (Relación Actualizada):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)


async def notify_relation_deleted(diagram_id: UUID, relation_id: UUID):
    payload = {
        "event": "relation.deleted",
        "data": {"id": str(relation_id)},
    }
    print("🔔 Evento emitido (Relación Eliminada):", payload)
    await ws_manager.broadcast(str(diagram_id), payload)
