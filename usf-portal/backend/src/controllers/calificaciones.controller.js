const Calificacion = require('../models/Calificacion');
const Notificacion = require('../models/Notificacion');

const verPorMateria = async (req, res) => {
  try {
    const calificaciones = await Calificacion.find({ materia_id: req.params.materiaId })
      .populate('alumno_id', 'nombre apellido matricula');
    res.json(calificaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registrar = async (req, res) => {
  try {
    const cal = await Calificacion.findById(req.params.id);
    if (!cal) return res.status(404).json({ message: 'Registro de calificación no encontrado' });
    if (cal.cerrada) return res.status(403).json({ message: 'El acta está cerrada, no se pueden modificar las calificaciones' });

    const { parcial1, parcial2, parcial3, final } = req.body;
    Object.assign(cal, { parcial1, parcial2, parcial3, final });
    await cal.save();

    // Notificación en tiempo real
    const notif = await Notificacion.create({
      destinatario_id: cal.alumno_id,
      titulo: 'Calificación registrada',
      mensaje: `Se registraron tus calificaciones para el periodo ${cal.periodo}`,
      tipo: 'calificacion'
    });

    const io = req.app.get('io');
    io.to(`user_${cal.alumno_id}`).emit('nueva_notificacion', notif);

    res.json(cal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { verPorMateria, registrar };
