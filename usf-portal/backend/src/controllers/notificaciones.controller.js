const Notificacion = require('../models/Notificacion');

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

module.exports = { listar, marcarLeida };
