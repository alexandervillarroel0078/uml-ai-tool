// frontend/src/api/realtime.js
let socket = null;
let listeners = {};

export function connect(diagramId) {
  if (socket) disconnect();

  // socket = new WebSocket(`ws://localhost:8000/ws/${diagramId}`);

  socket = new WebSocket(`ws://localhost:8000/diagrams/${diagramId}/ws`);

  socket.onopen = () => {
    console.log("✅ Conectado a WS", diagramId);
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log("📩 Evento recibido:", msg);
    if (listeners[msg.event]) {
      listeners[msg.event].forEach(cb => cb(msg.data));
    }
  };

  socket.onclose = () => {
    console.log("❌ WS cerrado");
  };
}

export function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
    listeners = {};
  }
}

export function onEvent(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}
