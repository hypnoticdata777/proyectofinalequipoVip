const Calificacion = require('../models/Calificacion');
const Notificacion = require('../models/Notificacion');
const { emitirAUsuario } = require('../utils/sse-manager');

const getMiGrupo = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const calificaciones = await Calificacion.find({ materia_id: materiaId, profesor_id: req.user.id })
      .populate('alumno_id', 'nombre apellido matricula email')
      .populate('materia_id', 'nombre clave periodo');
    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las calificaciones del grupo.' });
  }
};

// RF-20 + RF-22: Registrar calificación con notificación en tiempo real
const actualizarCalificacion = async (req, res) => {
  try {
    const calificacion = await Calificacion.findById(req.params.id)
      .populate('materia_id', 'nombre clave')
      .populate('alumno_id', '_id nombre');

    if (!calificacion) return res.status(404).json({ error: 'Calificación no encontrada.' });
    if (calificacion.cerrada) return res.status(403).json({ error: 'El acta está cerrada.' });

    const { parcial1, parcial2, parcial3, final } = req.body;
    if (parcial1 !== undefined) calificacion.parcial1 = parcial1;
    if (parcial2 !== undefined) calificacion.parcial2 = parcial2;
    if (parcial3 !== undefined) calificacion.parcial3 = parcial3;
    if (final !== undefined) calificacion.final = final;

    const parciales = [calificacion.parcial1, calificacion.parcial2, calificacion.parcial3]
      .filter(p => p !== null && p !== undefined);
    if (parciales.length > 0) {
      calificacion.final = Math.round((parciales.reduce((a, b) => a + b, 0) / parciales.length) * 100) / 100;
    }

    await calificacion.save();

    const alumnoId = calificacion.alumno_id._id.toString();
    const notif = await Notificacion.create({
      destinatario_id: alumnoId,
      tipo: 'calificacion',
      titulo: 'Calificación actualizada',
      mensaje: `Tu calificación en ${calificacion.materia_id.nombre} ha sido actualizada. Final: ${calificacion.final ?? 'pendiente'}`,
    });

    emitirAUsuario(alumnoId, 'nueva_notificacion', notif);

    res.json(calificacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la calificación.' });
  }
};

// RF-21: Cierre de actas
const cerrarActa = async (req, res) => {
  try {
    const calificacion = await Calificacion.findByIdAndUpdate(
      req.params.id,
      { cerrada: true, fechaCierre: new Date() },
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
    const calificaciones = await Calificacion.find({ alumno_id: alumnoId })
      .populate('materia_id', 'nombre clave creditos')
      .populate('profesor_id', 'nombre apellido');
    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las calificaciones.' });
  }
};

module.exports = { getMiGrupo, actualizarCalificacion, cerrarActa, getCalificacionesAlumno };
