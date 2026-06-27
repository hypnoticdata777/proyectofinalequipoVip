// Controlador base de calificaciones.
// Rutas adicionales (mi-grupo, cerrar acta) están en calificacion.controller.js
// e integradas en calificaciones.routes.js.
const Calificacion = require('../models/Calificacion');
const Notificacion = require('../models/Notificacion');
// SSE se dispara después de guardar en BD, no antes,
// para no notificar si la escritura falla.
// cerrada es irreversible: simula el cierre legal de acta escolar.
// No se valida en el frontend; la restricción vive en el backend.
// GET /api/calificaciones/:materiaId — devuelve todas las calificaciones de una materia (admin)
const verPorMateria = async (req, res) => {
  try {
    const calificaciones = await Calificacion.find({ materia_id: req.params.materiaId })
      .populate('alumno_id', 'nombre apellido matricula');
    res.json(calificaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/calificaciones/:id — registra parciales y final (profesor).
// Emite notificación en tiempo real al alumno via Socket.io.
const registrar = async (req, res) => {
  try {
    const cal = await Calificacion.findById(req.params.id);
    if (!cal) return res.status(404).json({ message: 'Registro de calificación no encontrado' });
    if (cal.cerrada) return res.status(403).json({ message: 'El acta está cerrada, no se pueden modificar las calificaciones' });

    const { parcial1, parcial2, parcial3, final } = req.body;
    Object.assign(cal, { parcial1, parcial2, parcial3, final });
    await cal.save();

    // Persiste notificación y la emite al alumno via Socket.io room
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

// GET /api/calificaciones/mis-calificaciones — devuelve calificaciones del alumno autenticado.
// Mapea al campo 'final' del modelo para que el frontend lo reciba como calificacionFinal.
const misCalificaciones = async (req, res) => {
  try {
    const calificaciones = await Calificacion.find({ alumno_id: req.user.id })
      .populate('materia_id', 'nombre clave');

    const resultado = calificaciones.map(cal => ({
      _id: cal._id,
      materia: cal.materia_id,
      parcial1: cal.parcial1,
      parcial2: cal.parcial2,
      parcial3: cal.parcial3,
      calificacionFinal: cal.final, // Alias legible para el frontend
      cerrada: cal.cerrada,
      periodo: cal.periodo
    }));

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { verPorMateria, registrar, misCalificaciones };
