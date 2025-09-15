 
import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

/** Nodo “hoja” 1920×1080 con borde/sombra (no draggable, no selectable) */
function PageNode() {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "var(--bg)",
        border: "1px solid var(--border)",
        boxShadow: "0 12px 40px rgba(0,0,0,.35)",
        borderRadius: 12,
      }}
    />
  );
}

const nodeTypes = { page: PageNode };

// Constantes de layout
const PAGE_W = 1920;
const PAGE_H = 1080;
const CARD_W = 150;   // ancho fijo de cada clase
const COLS   = 2;     // columnas del grid
const H_GAP  = 260;   // separación horizontal (>= CARD_W si quieres más aire)
const V_GAP  = 210;   // separación vertical

export default function Canvas({
  classes = [],
  relMode = false,
  onPickOrigin,
  onPickDest, // reservado para el 2º clic si lo usas luego
}) {
  const initialNodes = useMemo(() => {
    // --- hoja al fondo ---
    const pageNode = {
      id: "page",
      type: "page",
      position: { x: 0, y: 0 },
      data: {},
      draggable: false,
      selectable: false,
      zIndex: 0,
    };

    // cálculo del grid centrado
    const total = classes?.length || 0;
    const rows = Math.max(1, Math.ceil(total / COLS));
    const totalGridWidth  = (COLS - 1) * H_GAP + CARD_W;
    const totalGridHeight = (rows - 1) * V_GAP + 140; // 140 ≈ alto medio tarjeta
    const startX = Math.max(20, (PAGE_W - totalGridWidth) / 2);
    const startY = Math.max(20, (PAGE_H - totalGridHeight) / 2);

    const classNodes = (classes || []).map((c, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);

      return {
        id: String(c.id),
        position: {
          x: startX + col * H_GAP,
          y: startY + row * V_GAP,
        },
        data: {
          label: (
            <div style={{ width: CARD_W, padding: 12 }}>
              <div
                style={{
                  fontWeight: 800,
                  marginBottom: 8,
                  textAlign: "center",
                  color: "var(--text)",
                }}
              >
                {c.nombre}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                {(c.atributos ?? []).map((a, i) => (
                  <div key={i}>
                    • {a.nombre}:{a.tipo}
                    {a.requerido ? " *" : ""}
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        style: {
          width: CARD_W,
          border: "1px solid var(--border)",
          borderRadius: 12,
          background: "var(--bg)",
          boxShadow: "0 1px 0 rgba(0,0,0,.25)",
        },
        connectable: false, // ocultamos conexiones por ahora
        zIndex: 2,
      };
    });

    return [pageNode, ...classNodes];
  }, [classes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Aún sin edges (se añadirán cuando integremos relaciones)
  const edges = [];

  function onNodeClick(_, node) {
    if (!relMode) return;
    if (node.id === "page") return; // ignorar la hoja
    if (onPickOrigin) onPickOrigin(Number(node.id));
    // más adelante: si ya hay origen seleccionado, llamar a onPickDest(Number(node.id))
  }

  return (
    <div style={{ width: "100%", height: "100%", background: "var(--surface-2)" }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: true }}
        nodesDraggable={!relMode}
        nodesConnectable={false}
        elementsSelectable
        snapToGrid
        snapGrid={[16, 16]}
        style={{ background: "var(--surface-2)" }}
      >
        <Background variant="dots" color="var(--canvas-grid)" gap={16} size={1} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
