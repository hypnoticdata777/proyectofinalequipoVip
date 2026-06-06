const Materia = require('../models/Materia');

const listarMaterias = async (req, res) => {
  try {
    const { periodo } = req.query;
    const filtro = { activa: true };
    if (periodo) filtro.periodo = periodo;
    const materias = await Materia.find(filtro).populate('profesor', 'nombre apellido').populate('seriacion', 'nombre clave');
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las materias.' });
  }
};

const crearMateria = async (req, res) => {
  try {
    const materia = await Materia.create(req.body);
    res.status(201).json(materia);
  } catch (error) {
    res.status(400).json({ error: `Error al crear la materia: ${error.message}` });
  }
};

const actualizarMateria = async (req, res) => {
  try {
    const materia = await Materia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada.' });
    res.json(materia);
  } catch (error) {
    res.status(400).json({ error: `Error al actualizar la materia: ${error.message}` });
  }
};

const obtenerMateria = async (req, res) => {
  try {
    const materia = await Materia.findById(req.params.id).populate('profesor', 'nombre apellido').populate('seriacion', 'nombre clave');
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada.' });
    res.json(materia);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la materia.' });
  }
};

module.exports = { listarMaterias, crearMateria, actualizarMateria, obtenerMateria };
