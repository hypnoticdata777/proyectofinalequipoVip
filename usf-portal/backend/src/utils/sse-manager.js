// Mapa de clientes SSE activos: userId → array de Response objects
const clientes = new Map();

function agregarCliente(userId, res) {
  if (!clientes.has(userId)) {
    clientes.set(userId, []);
  }
  clientes.get(userId).push(res);
}

function eliminarCliente(userId, res) {
  if (!clientes.has(userId)) return;
  const restantes = clientes.get(userId).filter(r => r !== res);
  if (restantes.length === 0) {
    clientes.delete(userId);
  } else {
    clientes.set(userId, restantes);
  }
}

function emitirAUsuario(userId, evento, datos) {
  const conexiones = clientes.get(userId.toString());
  if (!conexiones || conexiones.length === 0) return;
  const payload = `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`;
  conexiones.forEach(res => {
    try { res.write(payload); } catch (_) { /* conexión cerrada */ }
  });
}

module.exports = { agregarCliente, eliminarCliente, emitirAUsuario };
