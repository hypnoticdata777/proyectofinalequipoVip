const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  alumno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  concepto: { type: String, required: true },
  monto: { type: Number, required: true, min: 0 },
  metodoPago: { type: String, enum: ['SPEI', 'OXXO', 'tarjeta', 'efectivo'], required: true },
  estado: { type: String, enum: ['pendiente', 'pagado', 'cancelado'], default: 'pendiente' },
  referencia: { type: String, unique: true },
  periodo: { type: String },
  fechaPago: { type: Date },
  stripePIId: { type: String },
}, { timestamps: true });

pagoSchema.pre('save', function (next) {
  if (!this.referencia) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referencia = `USF-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Pago', pagoSchema);
