const Inscripcion = require('../models/Inscripcion');
const { ejecutarInscripcion } = require('../services/inscripcion.service');

const inscribir = async (req, res) => {
  try {
    const { materiaIds, periodo } = req.body;
    const alumnoId = req.user.id;

    const inscripcion = await ejecutarInscripcion(alumnoId, materiaIds, periodo);
    res.status(201).json(inscripcion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.findById(req.params.id)
      .populate('alumno_id', 'nombre apellido matricula')
      .populate('materias', 'clave nombre creditos horario');
    if (!inscripcion) return res.status(404).json({ message: 'Inscripción no encontrada' });
    res.json(inscripcion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelar = async (req, res) => {
  try {
    const inscripcion = await Inscripcion.findById(req.params.id);
    if (!inscripcion) return res.status(404).json({ message: 'Inscripción no encontrada' });
    if (inscripcion.alumno_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No puedes cancelar una inscripción que no es tuya' });
    }

    inscripcion.estado = 'cancelada';
    await inscripcion.save();
    res.json({ message: 'Inscripción cancelada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { inscribir, obtener, cancelar };
