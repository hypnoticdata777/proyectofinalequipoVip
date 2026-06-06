const mongoose = require('mongoose');

const materiaSchema = new mongoose.Schema({
  clave: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  creditos: { type: Number, required: true },
  cupoMaximo: { type: Number, required: true },
  cupoDisponible: { type: Number, required: true },
  horario: [{
    dia: { type: String, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] },
    horaInicio: String,
    horaFin: String,
    salon: String,
  }],
  seriacion: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
  profesor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  periodo: { type: String, required: true },
  activa: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Materia', materiaSchema);
