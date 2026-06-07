const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  alumno_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  concepto:        { type: String, required: true },
  monto:           { type: Number, required: true },
  tipo:            { type: String, enum: ['colegiaturas', 'tramite'], required: true },
  estado:          { type: String, enum: ['pendiente', 'pagado', 'fallido'], default: 'pendiente' },
  metodo:          { type: String, enum: ['stripe', 'spei', 'oxxo'] },
  referencia:      { type: String },
  stripePaymentId: { type: String },
  fecha:           { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Pago', pagoSchema);
