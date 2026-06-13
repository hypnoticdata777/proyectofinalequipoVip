const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  destinatario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titulo:          { type: String, required: true },
  mensaje:         { type: String, required: true },
  tipo:            { type: String, enum: ['calificacion', 'horario', 'pago'], required: true },
  leida:           { type: Boolean, default: false },
  fecha:           { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notificacion', notificacionSchema);
