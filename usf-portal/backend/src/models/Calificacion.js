// Modelo de calificación — un registro por alumno por materia por periodo.
// El campo 'cerrada' bloquea modificaciones futuras (RF-21).
const mongoose = require('mongoose');

const calificacionSchema = new mongoose.Schema({
  alumno_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  materia_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true },
  profesor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodo:     { type: String, required: true },
  parcial1:    { type: Number, min: 0, max: 100 },
  parcial2:    { type: Number, min: 0, max: 100 },
  parcial3:    { type: Number, min: 0, max: 100 },
  final:       { type: Number, min: 0, max: 100 }, // Promedio calculado automáticamente
  cerrada:     { type: Boolean, default: false },
  fechaCierre: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Calificacion', calificacionSchema);
