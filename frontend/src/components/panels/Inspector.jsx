
import { useEffect, useRef, useState } from "react";
import {
  updateClass,
  listAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  listMethods,
  createMethod,
  updateMethod,
  deleteMethod,
} from "../../api/classes";

function useDebouncedCallback(cb, delay = 600) {
  const t = useRef(null);
  return (...args) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => cb(...args), delay);
  };
}

/** Tipos básicos sugeridos para el DSL/ORM */
const TYPE_OPTIONS = [
  { v: "string", label: "string" },
  { v: "text", label: "text" },
  { v: "int", label: "int" },
  { v: "float", label: "float" },
  { v: "decimal", label: "decimal" },
  { v: "boolean", label: "boolean" },
  { v: "date", label: "date" },
  { v: "datetime", label: "datetime" },
  { v: "uuid", label: "uuid" },
  { v: "email", label: "email" },
];

const inputBase = {
  width: "100%", height: 34, padding: "0 10px",
  borderRadius: 8, border: "1px solid #334", background: "#0e1526",
  color: "#fff", boxSizing: "border-box",
};
const selectBase = {
  ...inputBase, appearance: "none",
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, #9aa4c7 50%), linear-gradient(135deg, #9aa4c7 50%, transparent 50%), linear-gradient(#0e1526 0 0)",
  backgroundPosition: "calc(100% - 18px) 50%, calc(100% - 12px) 50%, 0 0",
  backgroundSize: "6px 6px, 6px 6px, 100% 100%",
  backgroundRepeat: "no-repeat",
};

export default function Inspector({ selected, onSoftUpdate }) {
  const [name, setName] = useState("");
  const [attr, setAttr] = useState([]);   // atributos
  const [meth, setMeth] = useState([]);   // métodos
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // cargar datos cuando cambia la clase seleccionada
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!selected?.id) { setAttr([]); setMeth([]); setName(""); return; }
      setLoading(true); setMsg("");
      setName(selected.name ?? selected.nombre ?? "");
      try {
        const [a, m] = await Promise.all([
          listAttributes(selected.id),
          listMethods(selected.id),
        ]);
        if (!alive) return;
        setAttr(a || []);
        setMeth(m || []);
      } catch (e) {
        if (!alive) return;
        setMsg(e?.response?.data?.detail || "No se pudo cargar detalles");
        setAttr([]); setMeth([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [selected?.id, selected?.name, selected?.nombre]);

  // rename autosave
  const debouncedSaveName = useDebouncedCallback(async (val) => {
    if (!selected?.id) return;
    try {
      await updateClass(selected.id, { name: val });
      onSoftUpdate?.({ id: selected.id, name: val });
    } catch (e) {
      setMsg(e?.response?.data?.detail || "No se pudo guardar el nombre");
    }
  }, 600);

  function onChangeName(val) {
    setName(val);
    debouncedSaveName(val);
  }

  // Atributos CRUD
  async function addAttr() {
    if (!selected?.id) return;
    const created = await createAttribute(selected.id, { name: "campo", type: "string", required: false });
    setAttr((p) => [created, ...p]);
  }
  async function patchAttr(aid, patch) {
    const updated = await updateAttribute(aid, patch);
    setAttr((p) => p.map(x => x.id === aid ? updated : x));
  }
  async function removeAttr(aid) {
    await deleteAttribute(aid);
    setAttr((p) => p.filter(x => x.id !== aid));
  }

  // Métodos CRUD
  async function addMeth() {
    if (!selected?.id) return;
    const created = await createMethod(selected.id, { name: "operacion", return_type: "void" });
    setMeth((p) => [created, ...p]);
  }
  async function patchMeth(mid, patch) {
    const updated = await updateMethod(mid, patch);
    setMeth((p) => p.map(x => x.id === mid ? updated : x));
  }
  async function removeMeth(mid) {
    await deleteMethod(mid);
    setMeth((p) => p.filter(x => x.id !== mid));
  }

  if (!selected) {
    return (
      <aside style={{ borderLeft: "1px solid #213", padding: 16, color: "#cbd4f5" }}>
        <div style={{ opacity: .7 }}>Selecciona una clase para editar</div>
      </aside>
    );
  }

  return (
    <aside style={{ borderLeft: "1px solid #213", padding: 16, overflow: "auto" }}>
      <h3 style={{ marginTop: 0 }}>Inspector</h3>
      <div style={{ fontSize: 12, opacity: .8, marginBottom: 6 }}>Clase ID: {selected.id}</div>

      {/* Nombre */}
      <label style={{ fontSize: 12, opacity: .8, display: "block", marginBottom: 4 }}>Nombre</label>
      <input
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        style={{ ...inputBase, height: 36 }}
        placeholder="Nombre de la clase"
        title="Nombre visible y del modelo"
      />

      {loading && <div style={{ marginTop: 8, fontSize: 12, opacity: .8 }}>Cargando detalles…</div>}
      {msg && <div style={{ marginTop: 8, fontSize: 12, color: "salmon" }}>{msg}</div>}

      {/* ATRIBUTOS */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
        <h4 style={{ margin: 0 }}>Atributos</h4>
        <button
          onClick={addAttr}
          style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}
          title="Agregar atributo"
        >
          + agregar
        </button>
      </div>

      {/* Cabecera compacta */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 84px 40px", gap: 8, marginTop: 6, fontSize: 12, opacity: .7 }}>
        <div>Nombre</div>
        <div>Tipo</div>
        <div title="Requerido = NOT NULL en BD">Requerido</div>
        <div> </div>
      </div>

      <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
        {attr.map(a => (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 84px 40px", gap: 8, alignItems: "center" }}>
            <input
              value={a.name ?? a.nombre ?? ""}
              onChange={(e) => patchAttr(a.id, { name: e.target.value })}
              placeholder="nombre"
              style={inputBase}
              title="Nombre del campo"
            />
            <select
              value={a.type ?? a.tipo ?? "string"}
              onChange={(e) => patchAttr(a.id, { type: e.target.value })}
              style={selectBase}
              title="Tipo de dato del atributo"
            >
              {TYPE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12 }}>
              <input
                type="checkbox"
                checked={!!a.required}
                onChange={(e) => patchAttr(a.id, { required: e.target.checked })}
                title="Si está marcado, el campo es NOT NULL (obligatorio)"
              />
              <span style={{ opacity: .85 }}>Sí</span>
            </label>
            <button
              onClick={() => removeAttr(a.id)}
              title="Eliminar atributo"
              style={{ border: "1px solid #334", background: "transparent", color: "inherit", borderRadius: 8, padding: "6px 8px" }}
            >
              🗑️
            </button>
          </div>
        ))}
        {attr.length === 0 && <div style={{ opacity: .7, fontSize: 12 }}>Sin atributos</div>}
      </div>

      {/* MÉTODOS */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
        <h4 style={{ margin: 0 }}>Métodos</h4>
        <button
          onClick={addMeth}
          style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: "1px solid #334", background: "transparent", color: "inherit" }}
          title="Agregar método"
        >
          + agregar
        </button>
      </div>

      {/* Cabecera compacta */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 40px", gap: 8, marginTop: 6, fontSize: 12, opacity: .7 }}>
        <div>Nombre</div>
        <div>Retorno</div>
        <div> </div>
      </div>

      <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
        {meth.map(m => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 40px", gap: 8, alignItems: "center" }}>
            <input
              value={m.name ?? ""}
              onChange={(e) => patchMeth(m.id, { name: e.target.value })}
              placeholder="nombre"
              style={inputBase}
              title="Nombre del método"
            />
            <select
              value={m.return_type ?? "void"}
              onChange={(e) => patchMeth(m.id, { return_type: e.target.value })}
              style={selectBase}
              title="Tipo de retorno"
            >
              <option value="void">void</option>
              {TYPE_OPTIONS.filter(o => o.v !== "uuid").map(o => (
                <option key={o.v} value={o.v}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => removeMeth(m.id)}
              title="Eliminar método"
              style={{ border: "1px solid #334", background: "transparent", color: "inherit", borderRadius: 8, padding: "6px 8px" }}
            >
              🗑️
            </button>
          </div>
        ))}
        {meth.length === 0 && <div style={{ opacity: .7, fontSize: 12 }}>Sin métodos</div>}
      </div>

      {/* Ayuda corta */}
      <div style={{ marginTop: 16, fontSize: 12, opacity: .75 }}>
        <strong>Requerido</strong> = NOT NULL en la base de datos. Si no está marcado, el campo es opcional (nullable).
      </div>
    </aside>
  );
}
