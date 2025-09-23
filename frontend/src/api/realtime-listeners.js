// frontend/src/api/realtime-listeners.js
import { onEvent } from "./realtime";

/**
 * Registra todos los listeners colaborativos
 * @param {Object} handlers - callbacks para actualizar estado en React
 */
export function registerRealtimeListeners({
  setClasses,
  setAttributes,
  setMethods,
  setRelations
}) {
  // ====== CLASES ======
  onEvent("class_created", (c) => setClasses(prev => [...prev, c]));
  onEvent("class_updated", (c) => setClasses(prev => prev.map(cl => cl.id === c.id ? c : cl)));
  onEvent("class_deleted", (classId) => setClasses(prev => prev.filter(cl => cl.id !== classId)));

  // ====== ATRIBUTOS ======
  onEvent("attribute_created", (a) => setAttributes(prev => [...prev, a]));
  onEvent("attribute_updated", (a) => setAttributes(prev => prev.map(attr => attr.id === a.id ? a : attr)));
  onEvent("attribute_deleted", (attrId) => setAttributes(prev => prev.filter(attr => attr.id !== attrId)));

  // ====== MÉTODOS ======
  onEvent("method_created", (m) => setMethods(prev => [...prev, m]));
  onEvent("method_updated", (m) => setMethods(prev => prev.map(mm => mm.id === m.id ? m : mm)));
  onEvent("method_deleted", (methodId) => setMethods(prev => prev.filter(mm => mm.id !== methodId)));

  // ====== RELACIONES ======
  onEvent("relation_created", (r) => setRelations(prev => [...prev, r]));
  onEvent("relation_updated", (r) => setRelations(prev => prev.map(rel => rel.id === r.id ? r : rel)));
  onEvent("relation_deleted", (relId) => setRelations(prev => prev.filter(rel => rel.id !== relId)));
}
