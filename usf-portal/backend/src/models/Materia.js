const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  dia:        { type: String, required: true },
  horaInicio: { type: String, required: true },
  horaFin:    { type: String, required: true },
  salon:      { type: String }
}, { _id: false });

const materiaSchema = new mongoose.Schema({
  clave:          { type: String, required: true, unique: true },
  nombre:         { type: String, required: true },
  creditos:       { type: Number, required: true },
  cupoMaximo:     { type: Number, required: true },
  cupoDisponible: { type: Number, required: true },
  horario:        [horarioSchema],
  seriacion:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
  profesor_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  periodo:        { type: String, required: true },
  activa:         { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Materia', materiaSchema);
