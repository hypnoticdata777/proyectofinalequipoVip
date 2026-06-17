// Modelo de inscripción — representa la lista de materias de un alumno en un periodo.
// Un alumno puede tener una sola inscripción activa ('confirmada') por periodo.
const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
  alumno_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodo:          { type: String, required: true },         // Ej: '2026-1'
  materias:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
  estado:           { type: String, enum: ['pendiente', 'confirmada', 'cancelada'], default: 'pendiente' },
  fechaInscripcion: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Inscripcion', inscripcionSchema);
