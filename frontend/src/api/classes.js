import api from "./client";

// ===== Helper para mapear nombre → name =====
// El backend usa `nombre`, pero en el frontend trabajamos con `name`
const mapClass = (c) => ({
  id: c.id,
  name: c.nombre,
  x_grid: c.x_grid,
  y_grid: c.y_grid,
  w_grid: c.w_grid,
  h_grid: c.h_grid,
  z_index: c.z_index,
});

// ====== CLASES ======

/** Lista todas las clases de un diagrama */
export const listClasses = (diagramId) =>
  api.get(`/diagrams/${diagramId}/classes`)
    .then(r => (r.data || []).map(mapClass));

/** Crea una nueva clase dentro de un diagrama */
export const createClass = (
  diagramId,
  { name, x_grid, y_grid, w_grid, h_grid, z_index } = {}
) => {
  const body = { name, x_grid, y_grid, w_grid, h_grid, z_index };
  console.log("[createClass] POST body:", body); // 👈 LOG
  
  return api.post(`/diagrams/${diagramId}/classes`, body)
    .then(r => {
      console.log("[createClass] response:", r.data); // 👈 LOG
      return mapClass(r.data);
    })
    .catch(err => {
      console.error("[createClass] error:", err?.response?.data || err); // 👈 LOG
      throw err;
    });
};

/** Actualiza una clase existente */
export const updateClass = (classId, patch) => {
  console.log("[updateClass] PATCH body:", patch); // 👈 LOG

  return api.patch(`/diagrams/classes/${classId}`, patch)
    .then(r => {
      console.log("[updateClass] response:", r.data); // 👈 LOG
      return mapClass(r.data);
    })
    .catch(err => {
      console.error("[updateClass] error:", err?.response?.data || err); // 👈 LOG
      throw err;
    });
};

/** Elimina una clase */
export const deleteClass = (classId) =>
  api.delete(`/diagrams/classes/${classId}`);

// ====== HELPERS DE CLASE ======

export const updateClassPosition = (classId, { x_grid, y_grid }) =>
  updateClass(classId, { x_grid, y_grid });

export const updateClassSize = (classId, { w_grid, h_grid }) =>
  updateClass(classId, { w_grid, h_grid });

export const updateClassZ = (classId, z_index) =>
  updateClass(classId, { z_index });

// ====== ATRIBUTOS ======

export const listAttributes = (classId) =>
  api.get(`/diagrams/classes/${classId}/attributes`).then(r => r.data);

export const createAttribute = (classId, { name, type, required = false }) =>
  api.post(`/diagrams/classes/${classId}/attributes`, { name, type, required }).then(r => r.data);

export const updateAttribute = (attrId, patch) =>
  api.patch(`/diagrams/attributes/${attrId}`, patch).then(r => r.data);

export const deleteAttribute = (attrId) =>
  api.delete(`/diagrams/attributes/${attrId}`);

// ====== MÉTODOS ======

export const listMethods = (classId) =>
  api.get(`/diagrams/classes/${classId}/methods`).then(r => r.data);

export const createMethod = (classId, { name, return_type = "void" }) =>
  api.post(`/diagrams/classes/${classId}/methods`, { name, return_type }).then(r => r.data);

export const updateMethod = (methodId, patch) =>
  api.patch(`/diagrams/methods/${methodId}`, patch).then(r => r.data);

export const deleteMethod = (methodId) =>
  api.delete(`/diagrams/methods/${methodId}`);
