export default function RelationInspector({ relation, onUpdate, onDelete }) {
  if (!relation) {
    return (
      <aside style={{ borderLeft: "1px solid #213", padding: 16, color: "#cbd4f5" }}>
        <div style={{ opacity: 0.7 }}>Selecciona una relación para editar</div>
      </aside>
    );
  }

  const wrap = { borderLeft: "1px solid #213", padding: 16, color: "#cbd4f5", overflow: "auto" };
  const label = { fontSize: 12, opacity: 0.8, marginBottom: 4, marginTop: 12 };
  const input = { width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #334", background: "#0e1526", color: "#fff" };

  return (
    <aside style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Relación</h3>
        <button
          onClick={onDelete}
          title="Eliminar relación"
          style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}
        >
          🗑️ Relación
        </button>
      </div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Relación ID: {relation.id}</div>

      {/* Tipo */}
      <div style={label}>Tipo</div>
      <select style={input} value={relation.type} onChange={(e) => onUpdate({ type: e.target.value })}>
        <option value="ASSOCIATION">Asociación</option>
        <option value="AGGREGATION">Agregación</option>
        <option value="COMPOSITION">Composición</option>
        <option value="INHERITANCE">Herencia</option>
        <option value="DEPENDENCY">Dependencia</option>
      </select>

      {/* Multiplicidad */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        <div>
          <div style={label}>Mult. origen</div>
          <select style={input} value={relation.src_mult_max ?? "*"} onChange={(e) => onUpdate({ src_mult_max: e.target.value })}>
            <option value="1">1</option>
            <option value="0..1">0..1</option>
            <option value="*">*</option>
          </select>
        </div>
        <div>
          <div style={label}>Mult. destino</div>
          <select style={input} value={relation.dst_mult_max ?? "*"} onChange={(e) => onUpdate({ dst_mult_max: e.target.value })}>
            <option value="1">1</option>
            <option value="0..1">0..1</option>
            <option value="*">*</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
