 
export default function RelationsPanel({
  classes = [],
  relMode, setRelMode,
  relType, setRelType,
  relA, setRelA,
  relB, setRelB,
  multA, setMultA,
  multB, setMultB,
  onCreate,
}) {
  const wrap = { background:"var(--surface)", borderLeft:"1px solid var(--border)", padding:20, overflow:"auto", height:"100%", color:"var(--text)" };
  const label = { fontSize:12, color:"var(--text-muted)", marginBottom:6, marginTop:14 };
  const input = { width:"100%", border:"2px solid var(--border)", borderRadius:10, padding:"10px 12px", background:"var(--bg)", color:"var(--text)" };
  const h2 = { margin:"0 0 12px", fontSize:20, fontWeight:800, color:"var(--text)" };
  const btn = { background:"var(--accent)", color:"#fff", border:"none", padding:"10px 14px", borderRadius:10, cursor:"pointer", fontWeight:700, width:"100%", marginTop:16 };
  const toggle = { marginBottom:12, display:"flex", alignItems:"center", gap:10 };

  return (
    <aside style={wrap}>
      <h2 style={h2}>Relaciones</h2>

      <label style={toggle}>
        <input type="checkbox" checked={relMode} onChange={e=>setRelMode(e.target.checked)} />
        <span>Modo crear relación (clic en A y luego en B en el canvas)</span>
      </label>

      <div style={label}>Origen</div>
      <select style={input} value={relA ?? ""} onChange={e=>setRelA(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Seleccionar…</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.nombre} (id {c.id})</option>)}
      </select>

      <div style={label}>Destino</div>
      <select style={input} value={relB ?? ""} onChange={e=>setRelB(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Seleccionar…</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.nombre} (id {c.id})</option>)}
      </select>

      <div style={label}>Tipo</div>
      <select style={input} value={relType} onChange={e=>setRelType(e.target.value)}>
        <option value="ASSOCIATION">Asociación</option>
        <option value="GENERALIZATION">Generalización</option>
      </select>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div>
          <div style={label}>Mult. origen</div>
          <select style={input} value={multA} onChange={e=>setMultA(e.target.value)}>
            <option>1</option><option>0..1</option><option>*</option>
          </select>
        </div>
        <div>
          <div style={label}>Mult. destino</div>
          <select style={input} value={multB} onChange={e=>setMultB(e.target.value)}>
            <option>1</option><option>0..1</option><option>*</option>
          </select>
        </div>
      </div>

      <button style={btn} onClick={onCreate} disabled={!relA || !relB}>
        Crear relación
      </button>
    </aside>
  );
}
