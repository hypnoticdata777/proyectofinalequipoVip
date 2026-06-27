// Modelo de materia con soporte para horarios, seriación y control de cupo.
const mongoose = require('mongoose');

// Sub-esquema para cada bloque de horario (puede haber varios por materia)
const horarioSchema = new mongoose.Schema({
  dia:        { type: String, required: true },  // 'lunes', 'martes', etc.
  horaInicio: { type: String, required: true },  // Formato 'HH:MM'
  horaFin:    { type: String, required: true },
  salon:      { type: String }
}, { _id: false });

const materiaSchema = new mongoose.Schema({
  clave:          { type: String, required: true, unique: true },
  nombre:         { type: String, required: true },
  creditos:       { type: Number, required: true },
  cupoMaximo:     { type: Number, required: true },
  cupoDisponible: { type: Number, required: true }, // Se decrementa al inscribir
  horario:        [horarioSchema],
  seriacion:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }], // Prerequisitos
  profesor_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  periodo:        { type: String, required: true }, // Ej: '2026-1'
  activa:         { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Materia', materiaSchema);

