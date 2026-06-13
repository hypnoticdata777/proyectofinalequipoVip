const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['calificacion', 'inscripcion', 'pago', 'sistema'], required: true },
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Notificacion', notificacionSchema);
