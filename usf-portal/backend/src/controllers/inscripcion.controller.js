// Controlador de inscripciones (RF-14, RF-15).
// Gestiona creación, consulta, listado y cancelación de inscripciones.
// La lógica de validación (cupo, seriación, horario, adeudos) vive en inscripcion.service.js.
const Inscripcion = require('../models/Inscripcion');
const Materia = require('../models/Materia');
const { validarInscripcion } = require('../services/inscripcion.service');

// POST /api/inscripciones — el alumno inscribe un conjunto de materias en un periodo
const crearInscripcion = async (req, res) => {
  try {
    const { materias, periodo } = req.body;
    const alumnoId = req.user.id;

    // Lanza error si alguna validación de negocio falla
    await validarInscripcion(alumnoId, materias, periodo);

    const inscripcion = await Inscripcion.create({ alumno_id: alumnoId, periodo, materias, estado: 'confirmada' });

    // Decrementa cupo disponible en cada materia inscrita
    await Materia.updateMany({ _id: { $in: materias } }, { $inc: { cupoDisponible: -1 } });

    const inscripcionPopulada = await Inscripcion.findById(inscripcion._id)
      .populate('materias')
      .populate('alumno_id', 'nombre apellido matricula');
    res.status(201).json(inscripcionPopulada);
  } catch (error) {
    const codigo = error.message.split(':')[0];
    res.status(400).json({ error: error.message, codigo });
  }
};

// GET /api/inscripciones/mi-inscripcion — devuelve la inscripción activa del alumno autenticado
const getMiInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.findOne({ alumno_id: req.user.id, estado: 'confirmada' })
      .populate({ path: 'materias', populate: { path: 'profesor_id', select: 'nombre apellido' } })
      .populate('alumno_id', 'nombre apellido matricula');
    if (!inscripcion) return res.status(404).json({ error: 'No tienes una inscripción activa.' });
    res.json(inscripcion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la inscripción.' });
  }
};

// GET /api/inscripciones — lista todas las inscripciones (admin); acepta ?periodo= para filtrar
const listarInscripciones = async (req, res) => {
  try {
    const { periodo } = req.query;
    const filtro = {};
    if (periodo) filtro.periodo = periodo;
    const inscripciones = await Inscripcion.find(filtro)
      .populate('alumno_id', 'nombre apellido matricula email')
      .populate('materias', 'nombre clave creditos');
    res.json(inscripciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las inscripciones.' });
  }
};

// PUT /api/inscripciones/:id/cancelar  |  DELETE /api/inscripciones/:id
// Cancela la inscripción y devuelve el cupo a las materias involucradas.
const cancelarInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.findById(req.params.id);
    if (!inscripcion) return res.status(404).json({ error: 'Inscripción no encontrada.' });
    if (inscripcion.estado === 'cancelada') return res.status(400).json({ error: 'La inscripción ya está cancelada.' });

    const materiasAntes = inscripcion.materias;
    inscripcion.estado = 'cancelada';
    await inscripcion.save();

    await Materia.updateMany({ _id: { $in: materiasAntes } }, { $inc: { cupoDisponible: 1 } });

    res.json({ mensaje: 'Inscripción cancelada exitosamente.', inscripcion });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar la inscripción.' });
  }
};

module.exports = { crearInscripcion, getMiInscripcion, listarInscripciones, cancelarInscripcion };
