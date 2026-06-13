const Materia = require('../models/Materia');

const listar = async (req, res) => {
  try {
    const { periodo } = req.query;
    const filtro = { activa: true };
    if (periodo) filtro.periodo = periodo;
    const materias = await Materia.find(filtro).populate('profesor_id', 'nombre apellido').populate('seriacion', 'clave nombre');
    res.json(materias);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const materia = await Materia.create(req.body);
    res.status(201).json(materia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const materia = await Materia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });
    res.json(materia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const materia = await Materia.findByIdAndUpdate(req.params.id, { activa: false }, { new: true });
    if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });
    res.json({ message: 'Materia desactivada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
