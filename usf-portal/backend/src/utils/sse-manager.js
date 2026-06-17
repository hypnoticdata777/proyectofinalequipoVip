// Gestor de conexiones SSE (Server-Sent Events).
// Mantiene un mapa de userId → array de Response objects activos.
// Permite emitir eventos push al navegador sin librerías externas.
const clientes = new Map();

// Registra una nueva conexión SSE para un usuario
function agregarCliente(userId, res) {
  if (!clientes.has(userId)) clientes.set(userId, []);
  clientes.get(userId).push(res);
}

// Elimina la conexión cuando el cliente cierra el EventSource
function eliminarCliente(userId, res) {
  if (!clientes.has(userId)) return;
  const restantes = clientes.get(userId).filter(r => r !== res);
  if (restantes.length === 0) {
    clientes.delete(userId);
  } else {
    clientes.set(userId, restantes);
  }
}

// Emite un evento SSE a todas las conexiones activas de un usuario.
// El navegador recibe esto en el listener de EventSource.addEventListener(evento, handler).
function emitirAUsuario(userId, evento, datos) {
  const conexiones = clientes.get(userId.toString());
  if (!conexiones || conexiones.length === 0) return;
  const payload = `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`;
  conexiones.forEach(res => {
    try { res.write(payload); } catch (_) { /* conexión ya cerrada */ }
  });
}

module.exports = { agregarCliente, eliminarCliente, emitirAUsuario };
