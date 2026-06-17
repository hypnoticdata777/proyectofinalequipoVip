// Modelo de notificación — se persiste en BD y además se emite por SSE en tiempo real.
// 'leida' permite mostrar el badge de "sin leer" en el frontend.
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
