const jwt = require('jsonwebtoken');
const Notificacion = require('../models/Notificacion');
const { agregarCliente, eliminarCliente } = require('../utils/sse-manager');

const listar = async (req, res) => {
  try {
    const notificaciones = await Notificacion.find({ destinatario_id: req.user.id }).sort({ fecha: -1 });
    res.json(notificaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const marcarLeida = async (req, res) => {
  try {
    const notif = await Notificacion.findByIdAndUpdate(
      req.params.id,
      { leida: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notificación no encontrada' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RF-22: Endpoint SSE — el cliente se conecta y recibe eventos en tiempo real
// El token va en query param porque EventSource no admite headers personalizados
const streamNotificaciones = (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).end('Token requerido');

  let usuario;
  try {
    usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).end('Token inválido o expirado');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.flushHeaders();

  // Ping cada 30 segundos para mantener la conexión viva
  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (_) { clearInterval(ping); }
  }, 30000);

  agregarCliente(usuario.id, res);

  req.on('close', () => {
    clearInterval(ping);
    eliminarCliente(usuario.id, res);
  });
};

module.exports = { listar, marcarLeida, streamNotificaciones };
