const Pago = require('../models/Pago');

const listarPorAlumno = async (req, res) => {
  try {
    const pagos = await Pago.find({ alumno_id: req.params.alumnoId }).sort({ fecha: -1 });
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const misPagos = async (req, res) => {
  try {
    const pagos = await Pago.find({ alumno_id: req.user.id }).sort({ fecha: -1 });
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const crearPago = async (req, res) => {
  try {
    const { alumno_id, concepto, monto, tipo, metodo } = req.body;
    const referencia = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const pago = await Pago.create({ alumno_id, concepto, monto, tipo, metodo, referencia });
    res.status(201).json(pago);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const marcarPagado = async (req, res) => {
  try {
    const pago = await Pago.findByIdAndUpdate(
      req.params.id,
      { estado: 'pagado' },
      { new: true }
    );
    if (!pago) return res.status(404).json({ message: 'Pago no encontrado' });
    res.json(pago);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listarPorAlumno, misPagos, crearPago, marcarPagado };
