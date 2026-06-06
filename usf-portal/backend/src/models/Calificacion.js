const mongoose = require('mongoose');

const calificacionSchema = new mongoose.Schema({
  alumno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  materia: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true },
  profesor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodo: { type: String, required: true },
  parcial1: { type: Number, min: 0, max: 100, default: null },
  parcial2: { type: Number, min: 0, max: 100, default: null },
  parcial3: { type: Number, min: 0, max: 100, default: null },
  calificacionFinal: { type: Number, min: 0, max: 100, default: null },
  cerrada: { type: Boolean, default: false },
  fechaCierre: { type: Date, default: null },
}, { timestamps: true });

calificacionSchema.virtual('promedio').get(function () {
  const parciales = [this.parcial1, this.parcial2, this.parcial3].filter(p => p !== null);
  if (parciales.length === 0) return null;
  return parciales.reduce((a, b) => a + b, 0) / parciales.length;
});

calificacionSchema.pre('save', function (next) {
  if (this.isModified('cerrada') && this.cerrada) {
    this.fechaCierre = new Date();
  }
  next();
});

module.exports = mongoose.model('Calificacion', calificacionSchema);
