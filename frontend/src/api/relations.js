//  // src/api/relations.js
// import api from "./client";

// // util: limpia campos undefined del payload
// const omitUndefined = (obj) =>
//   Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// /** Lista todas las relaciones de un diagrama */
// export const listRelations = (diagramId) =>
//   api.get(`/diagrams/${diagramId}/relations`).then((r) => r.data);

// /**
//  * Crea una relación en el diagrama
//  *
//  * @param {string} diagramId
//  * @param {{
//  *   from_class: string,
//  *   to_class: string,
//  *   type: "ASSOCIATION"|"AGGREGATION"|"COMPOSITION"|"INHERITANCE"|"DEPENDENCY",
//  *   label?: string,
//  *   src_anchor?: "left"|"right"|"top"|"bottom",
//  *   dst_anchor?: "left"|"right"|"top"|"bottom",
//  *   src_offset?: number, dst_offset?: number,
//  *   src_lane?: number,   dst_lane?: number,
//  *   // multiplicidad (min entero >=0; max entero >=0 | "*" | null)
//  *   src_mult_min?: number,
//  *   src_mult_max?: number|"*"|null,
//  *   dst_mult_min?: number,
//  *   dst_mult_max?: number|"*"|null,
//  * }} params
//  */
// export const createRelation = (
//   diagramId,
//   {
//     from_class,
//     to_class,
//     type,
//     label,
//     src_anchor,
//     dst_anchor,
//     src_offset,
//     dst_offset,
//     src_lane,
//     dst_lane,
//     src_mult_min,
//     src_mult_max, // acepta número, "*" o null
//     dst_mult_min,
//     dst_mult_max, // acepta número, "*" o null
//   }
// ) =>
//   api
//     .post(
//       `/diagrams/${diagramId}/relations`,
//       omitUndefined({
//         from_class,
//         to_class,
//         type,
//         label,
//         src_anchor,
//         dst_anchor,
//         src_offset,
//         dst_offset,
//         src_lane,
//         dst_lane,
//         src_mult_min,
//         src_mult_max,
//         dst_mult_min,
//         dst_mult_max,
//       })
//     )
//     .then((r) => r.data);

// /**
//  * Actualiza datos de la relación
//  *
//  * Campos válidos en `patch` (todos opcionales):
//  * - type, label
//  * - src_anchor, dst_anchor
//  * - src_offset, dst_offset, src_lane, dst_lane
//  * - src_mult_min, src_mult_max (número | "*" | null)
//  * - dst_mult_min, dst_mult_max (número | "*" | null)
//  */
// export const updateRelation = (relationId, patch = {}) =>
//   api
//     .patch(`/diagrams/relations/${relationId}`, omitUndefined(patch))
//     .then((r) => r.data);

// /** Elimina una relación */
// export const deleteRelation = (relationId) =>
//   api.delete(`/diagrams/relations/${relationId}`).then(() => true);
// src/api/relations.js
import api from "./client";

const omitUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/** Normaliza multiplicidades antes de enviar al backend */
const normalizeMult = (val) => {
  if (val === "*" || val === "" || val == null) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
};

/** Lista todas las relaciones de un diagrama */
export const listRelations = (diagramId) =>
  api.get(`/diagrams/${diagramId}/relations`).then((r) => r.data);

/** Crear relación */
export const createRelation = (diagramId, params) => {
  return api
    .post(`/diagrams/${diagramId}/relations`,
      omitUndefined({
        from_class: params.from_class,
        to_class: params.to_class,
        type: params.type,
        label: params.label,
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

/** Actualizar relación */
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

/** Eliminar relación */
export const deleteRelation = (relationId) =>
  api.delete(`/diagrams/relations/${relationId}`).then(() => true);
