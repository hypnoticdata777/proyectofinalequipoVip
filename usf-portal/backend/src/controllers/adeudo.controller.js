const Adeudo = require('../models/Adeudo');

const listarAdeudos = async (req, res) => {
  try {
    const { alumnoId, estado, periodo } = req.query;
    const filtro = {};
    if (alumnoId) filtro.alumno_id = alumnoId;
    if (estado) filtro.estado = estado;
    if (periodo) filtro.periodo = periodo;

    const adeudos = await Adeudo.find(filtro)
      .populate('alumno_id', 'nombre apellido matricula email')
      .populate('registradoPor', 'nombre apellido')
      .sort({ fechaRegistro: -1 });
    res.json(adeudos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los adeudos.' });
  }
};

const crearAdeudo = async (req, res) => {
  try {
    const adeudo = await Adeudo.create({ ...req.body, registradoPor: req.user.id });
    const adeudoPopulado = await Adeudo.findById(adeudo._id)
      .populate('alumno_id', 'nombre apellido matricula')
      .populate('registradoPor', 'nombre apellido');
    res.status(201).json(adeudoPopulado);
  } catch (error) {
    res.status(400).json({ error: `Error al crear el adeudo: ${error.message}` });
  }
};

const marcarPagado = async (req, res) => {
  try {
    const adeudo = await Adeudo.findById(req.params.id);
    if (!adeudo) return res.status(404).json({ error: 'Adeudo no encontrado.' });
    if (adeudo.estado === 'pagado') return res.status(400).json({ error: 'El adeudo ya está marcado como pagado.' });

    adeudo.estado = 'pagado';
    adeudo.fechaPago = new Date();
    await adeudo.save();

    res.json({ mensaje: 'Adeudo marcado como pagado exitosamente.', adeudo });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el adeudo.' });
  }
};

const getMisAdeudos = async (req, res) => {
  try {
    const adeudos = await Adeudo.find({ alumno_id: req.user.id }).sort({ fechaRegistro: -1 });
    res.json(adeudos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tus adeudos.' });
  }
};

module.exports = { listarAdeudos, crearAdeudo, marcarPagado, getMisAdeudos };
