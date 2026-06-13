const Notificacion = require('../models/Notificacion');

const getMisNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.find({ usuario: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones.' });
  }
};

const marcarLeida = async (req, res) => {
  try {
    const notif = await Notificacion.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user.id },
      { leida: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notificación no encontrada.' });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar la notificación.' });
  }
};

const marcarTodasLeidas = async (req, res) => {
  try {
    await Notificacion.updateMany({ usuario: req.user.id, leida: false }, { leida: true });
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar notificaciones.' });
  }
};

module.exports = { getMisNotificaciones, marcarLeida, marcarTodasLeidas };
