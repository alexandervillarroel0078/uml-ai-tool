//se usa cuando seleccionas una relacion
//src/components/panels/RelationInspector.jsx
import { useState, useEffect } from "react";

function useDebouncedCallback(callback, delay) {
  const [timeoutId, setTimeoutId] = useState(null);

  function debounced(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => callback(...args), delay);
    setTimeoutId(id);
  }

  return debounced;
}

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
  const input = {
    width: "100%",
    padding: "8px",
    borderRadius: 8,
    border: "1px solid #334",
    background: "#0e1526",
    color: "#fff"
  };

  // Estado local del label
  // const [localLabel, setLocalLabel] = useState(relation.label ?? "");
  const [localLabel, setLocalLabel] = useState(relation.etiqueta ?? "");
  useEffect(() => {
    setLocalLabel(relation.etiqueta ?? "");
    // }, [relation]);
    // }, [relation?.id]);
  }, [relation?.id, relation?.etiqueta]);

  // 🔑 helper para siempre enviar el body completo
  const fullUpdate = (patch) => {
    onUpdate({
      type: relation.type,
      // label: relation.label,
      // label: localLabel,
      label: patch.label ?? relation.label ?? "",
      src_anchor: relation.src_anchor ?? "right",
      dst_anchor: relation.dst_anchor ?? "left",
      src_offset: relation.src_offset ?? 0,
      dst_offset: relation.dst_offset ?? 0,
      src_lane: relation.src_lane ?? 0,
      dst_lane: relation.dst_lane ?? 0,
      src_mult_min: relation.src_mult_min ?? 0,
      src_mult_max: relation.src_mult_max,
      dst_mult_min: relation.dst_mult_min ?? 0,
      dst_mult_max: relation.dst_mult_max,
      ...patch,
    });
  };

  // Debounce para guardar mientras escribes
  const debouncedUpdate = useDebouncedCallback(
    (val) => fullUpdate({ label: val }),
    400 // ms
  );

  return (
    <aside style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Relación</h3>
        <button
          onClick={onDelete}
          title="Eliminar relación"
          style={{
            marginLeft: "auto",
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #334",
            background: "transparent",
            color: "inherit",
          }}
        >
          🗑️ Relación
        </button>
      </div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
        Relación ID: {relation.id}
      </div>

      {/* Tipo */}
      <div style={label}>Tipo</div>
      <select
        style={input}
        value={relation.tipo}
        onChange={(e) => fullUpdate({ type: e.target.value })}
      >
        <option value="ASSOCIATION">Asociación</option>
        <option value="AGGREGATION">Agregación</option>
        <option value="COMPOSITION">Composición</option>
        <option value="INHERITANCE">Herencia</option>
        <option value="DEPENDENCY">Dependencia</option>
      </select>

      {/* Anchors */}
      <div style={label}>Anchor Origen</div>
      <select
        style={input}
        value={relation.src_anchor ?? "right"}
        onChange={(e) => fullUpdate({ src_anchor: e.target.value })}
      >
        <option value="left">Izquierda</option>
        <option value="right">Derecha</option>
        <option value="top">Arriba</option>
        <option value="bottom">Abajo</option>
      </select>

      <div style={label}>Anchor Destino</div>
      <select
        style={input}
        value={relation.dst_anchor ?? "left"}
        onChange={(e) => fullUpdate({ dst_anchor: e.target.value })}
      >
        <option value="left">Izquierda</option>
        <option value="right">Derecha</option>
        <option value="top">Arriba</option>
        <option value="bottom">Abajo</option>
      </select>

      {/* Label */}
      <div style={label}>Etiqueta (label)</div>
      <input
        style={input}
        type="text"
        value={localLabel}
        placeholder={localLabel ? "" : "ej: usa, pertenece, compone"}
        onChange={(e) => {
          setLocalLabel(e.target.value); // ✅ actualiza solo local
          debouncedUpdate(e.target.value); // ✅ guarda con retardo
        }}
      />

      {/* Multiplicidad */}
      {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <div style={label}>Origen mín</div>
          <input
            style={input}
            type="number"
            min={0}
            value={relation.src_mult_min ?? ""}
            onChange={(e) =>
              fullUpdate({ src_mult_min: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>
        <div>
          <div style={label}>Origen máx</div>
          <input
            style={input}
            type="text"
            value={relation.src_mult_max == null ? "*" : relation.src_mult_max}
            onChange={(e) =>
              fullUpdate({
                src_mult_max: e.target.value === "*" ? null : Number(e.target.value),
              })
            }
          />
        </div>
        <div>
          <div style={label}>Destino mín</div>
          <input
            style={input}
            type="number"
            min={0}
            value={relation.dst_mult_min ?? ""}
            onChange={(e) =>
              fullUpdate({ dst_mult_min: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>
        <div>
          <div style={label}>Destino máx</div>
          <input
            style={input}
            type="text"
            value={relation.dst_mult_max == null ? "*" : relation.dst_mult_max}
            onChange={(e) =>
              fullUpdate({
                dst_mult_max: e.target.value === "*" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div> */}
      {/* Multiplicidad */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <div style={label}>Origen mín</div>
          <input
            style={input}
            type="number"
            min={0}
            value={relation.mult_origen_min ?? ""}
            onChange={(e) =>
              fullUpdate({ mult_origen_min: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>
        <div>
          <div style={label}>Origen máx</div>
          <input
            style={input}
            type="text"
            value={relation.mult_origen_max == null ? "*" : relation.mult_origen_max}
            onChange={(e) =>
              fullUpdate({
                mult_origen_max: e.target.value === "*" ? null : Number(e.target.value),
              })
            }
          />
        </div>
        <div>
          <div style={label}>Destino mín</div>
          <input
            style={input}
            type="number"
            min={0}
            value={relation.mult_destino_min ?? ""}
            onChange={(e) =>
              fullUpdate({ mult_destino_min: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>
        <div>
          <div style={label}>Destino máx</div>
          <input
            style={input}
            type="text"
            value={relation.mult_destino_max == null ? "*" : relation.mult_destino_max}
            onChange={(e) =>
              fullUpdate({
                mult_destino_max: e.target.value === "*" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div>

    </aside>
  );
}
