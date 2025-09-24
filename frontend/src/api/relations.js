import api from "./client";

// 🔹 Helper: elimina las claves cuyo valor es `undefined`
// Esto evita enviar campos vacíos al backend innecesariamente.
const omitUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// 🔹 Helper: normaliza valores de multiplicidad (*, vacíos, null → null; números válidos → Number)
const normalizeMult = (val) => {
  if (val === "*" || val === "" || val == null) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
};

// ====== RELATIONS API ======

/** 
 * Lista todas las relaciones de un diagrama
 * @param {string} diagramId - ID del diagrama
 * @returns {Array} lista de relaciones
 */
export const listRelations = (diagramId) =>
  api.get(`/diagrams/${diagramId}/relations`).then((r) => r.data);

/**
 * Crear una relación entre dos clases
 * Recibe parámetros como clases origen/destino, tipo, anclas, offsets, lanes y multiplicidades.
 * Normaliza y omite campos vacíos antes de enviar.
 */
export const createRelation = (diagramId, params) => {
  return api
    .post(`/diagrams/${diagramId}/relations`,
      omitUndefined({
        from_class: params.from_class,
        to_class: params.to_class,
        type: params.type,          // tipo de relación (ASSOCIATION, DEPENDENCY, etc.)
        label: params.label,        // texto/etiqueta
        src_anchor: params.src_anchor,
        dst_anchor: params.dst_anchor,
        src_offset: params.src_offset,
        dst_offset: params.dst_offset,
        src_lane: params.src_lane,
        dst_lane: params.dst_lane,
        src_mult_min: normalizeMult(params.src_mult_min),
        src_mult_max: normalizeMult(params.src_mult_max),
        dst_mult_min: normalizeMult(params.dst_mult_min),
        dst_mult_max: normalizeMult(params.dst_mult_max),
      })
    )
    .then((r) => r.data);
};

/**
 * Actualizar una relación existente por su ID.
 * Solo envía los campos presentes en `patch`.
 */
export const updateRelation = (relationId, patch = {}) => {
  return api
    .patch(`/diagrams/relations/${relationId}`,
      omitUndefined({
        type: patch.type,
        label: patch.label,
        src_anchor: patch.src_anchor,
        dst_anchor: patch.dst_anchor,
        src_offset: patch.src_offset,
        dst_offset: patch.dst_offset,
        src_lane: patch.src_lane,
        dst_lane: patch.dst_lane,
        src_mult_min: normalizeMult(patch.src_mult_min),
        src_mult_max: normalizeMult(patch.src_mult_max),
        dst_mult_min: normalizeMult(patch.dst_mult_min),
        dst_mult_max: normalizeMult(patch.dst_mult_max),
      })
    )
    .then((r) => r.data);
};

/**
 * Eliminar una relación por su ID
 * Retorna true si se eliminó correctamente
 */
export const deleteRelation = (relationId) =>
  api.delete(`/diagrams/relations/${relationId}`).then(() => true);

/**
 * Obtener una relación específica por ID
 */
export const getRelation = (relationId) =>
  api.get(`/diagrams/relations/${relationId}`).then((r) => r.data);
