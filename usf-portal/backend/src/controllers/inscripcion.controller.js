const Inscripcion = require('../models/Inscripcion');
const Materia = require('../models/Materia');
const { validarInscripcion } = require('../services/inscripcion.service');

const crearInscripcion = async (req, res) => {
  try {
    const { materias, periodo } = req.body;
    const alumnoId = req.user.id;

    await validarInscripcion(alumnoId, materias, periodo);

    const inscripcion = await Inscripcion.create({ alumno: alumnoId, periodo, materias, estado: 'confirmada' });

    // Decrementar cupo disponible en cada materia
    await Materia.updateMany({ _id: { $in: materias } }, { $inc: { cupoDisponible: -1 } });

    const inscripcionPopulada = await Inscripcion.findById(inscripcion._id).populate('materias').populate('alumno', 'nombre apellido matricula');
    res.status(201).json(inscripcionPopulada);
  } catch (error) {
    const codigo = error.message.split(':')[0];
    res.status(400).json({ error: error.message, codigo });
  }
};

const getMiInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.findOne({ alumno: req.user.id, estado: 'confirmada' })
      .populate({ path: 'materias', populate: { path: 'profesor', select: 'nombre apellido' } })
      .populate('alumno', 'nombre apellido matricula');
    if (!inscripcion) return res.status(404).json({ error: 'No tienes una inscripción activa.' });
    res.json(inscripcion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la inscripción.' });
  }
};

const listarInscripciones = async (req, res) => {
  try {
    const { periodo } = req.query;
    const filtro = {};
    if (periodo) filtro.periodo = periodo;
    const inscripciones = await Inscripcion.find(filtro)
      .populate('alumno', 'nombre apellido matricula email')
      .populate('materias', 'nombre clave creditos');
    res.json(inscripciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las inscripciones.' });
  }
};

const cancelarInscripcion = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.findById(req.params.id);
    if (!inscripcion) return res.status(404).json({ error: 'Inscripción no encontrada.' });
    if (inscripcion.estado === 'cancelada') return res.status(400).json({ error: 'La inscripción ya está cancelada.' });

    const materiasAntes = inscripcion.materias;
    inscripcion.estado = 'cancelada';
    await inscripcion.save();

    // Devolver cupo a las materias
    await Materia.updateMany({ _id: { $in: materiasAntes } }, { $inc: { cupoDisponible: 1 } });

    res.json({ mensaje: 'Inscripción cancelada exitosamente.', inscripcion });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar la inscripción.' });
  }
};

module.exports = { crearInscripcion, getMiInscripcion, listarInscripciones, cancelarInscripcion };
