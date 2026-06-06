const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
  alumno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodo: { type: String, required: true },
  materias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
  estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada'], default: 'pendiente' },
  fechaInscripcion: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Inscripcion', inscripcionSchema);
