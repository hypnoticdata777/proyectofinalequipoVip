const Calificacion = require('../models/Calificacion');
const Inscripcion = require('../models/Inscripcion');
const Notificacion = require('../models/Notificacion');

const getMiGrupo = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const calificaciones = await Calificacion.find({ materia: materiaId, profesor: req.user.id })
      .populate('alumno', 'nombre apellido matricula email')
      .populate('materia', 'nombre clave periodo');
    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las calificaciones del grupo.' });
  }
};

// RF-20 + RF-22: Registrar calificación y emitir notificación en tiempo real
const actualizarCalificacion = async (req, res) => {
  try {
    const calificacion = await Calificacion.findById(req.params.id)
      .populate('materia', 'nombre clave')
      .populate('alumno', '_id nombre');

    if (!calificacion) return res.status(404).json({ error: 'Calificación no encontrada.' });
    if (calificacion.cerrada) return res.status(403).json({ error: 'El acta está cerrada.' });

    const { parcial1, parcial2, parcial3, calificacionFinal } = req.body;
    if (parcial1 !== undefined) calificacion.parcial1 = parcial1;
    if (parcial2 !== undefined) calificacion.parcial2 = parcial2;
    if (parcial3 !== undefined) calificacion.parcial3 = parcial3;
    if (calificacionFinal !== undefined) calificacion.calificacionFinal = calificacionFinal;

    const parciales = [calificacion.parcial1, calificacion.parcial2, calificacion.parcial3].filter(p => p !== null);
    if (parciales.length > 0) {
      calificacion.calificacionFinal = Math.round((parciales.reduce((a, b) => a + b, 0) / parciales.length) * 100) / 100;
    }

    await calificacion.save();

    // RF-22: Persistir notificación y emitir por Socket.io
    const alumnoId = calificacion.alumno._id.toString();
    const notif = await Notificacion.create({
      usuario: alumnoId,
      tipo: 'calificacion',
      titulo: 'Calificación actualizada',
      mensaje: `Tu calificación en ${calificacion.materia.nombre} ha sido actualizada. Final: ${calificacion.calificacionFinal ?? 'pendiente'}`,
      meta: { calificacionId: calificacion._id, materiaId: calificacion.materia._id },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(alumnoId).emit('notificacion', {
        tipo: 'calificacion',
        titulo: notif.titulo,
        mensaje: notif.mensaje,
        timestamp: notif.createdAt,
      });
    }

    res.json(calificacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la calificación.' });
  }
};

// RF-21: Bloqueo de actas cerradas
const cerrarActa = async (req, res) => {
  try {
    const calificacion = await Calificacion.findByIdAndUpdate(
      req.params.id,
      { cerrada: true },
      { new: true }
    );
    if (!calificacion) return res.status(404).json({ error: 'Calificación no encontrada.' });
    res.json({ mensaje: 'Acta cerrada exitosamente.', calificacion });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar el acta.' });
  }
};

const getCalificacionesAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    if (req.user.rol === 'alumno' && req.user.id !== alumnoId) {
      return res.status(403).json({ error: 'No tienes permisos para ver estas calificaciones.' });
    }
    const calificaciones = await Calificacion.find({ alumno: alumnoId })
      .populate('materia', 'nombre clave creditos')
      .populate('profesor', 'nombre apellido');
    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las calificaciones.' });
  }
};

module.exports = { getMiGrupo, actualizarCalificacion, cerrarActa, getCalificacionesAlumno };
