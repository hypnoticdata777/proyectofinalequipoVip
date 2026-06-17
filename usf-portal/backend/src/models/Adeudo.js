const mongoose = require('mongoose');

const adeudoSchema = new mongoose.Schema({
  alumno_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  concepto:       { type: String, required: true },
  monto:          { type: Number, required: true },
  estado:         { type: String, enum: ['pendiente', 'pagado'], default: 'pendiente' },
  periodo:        { type: String, required: true },
  fechaRegistro:  { type: Date, default: Date.now },
  fechaPago:      { type: Date, default: null },
  registradoPor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Adeudo', adeudoSchema);
