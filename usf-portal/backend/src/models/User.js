const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { type: String, enum: ['alumno', 'profesor', 'admin'], default: 'alumno' },
  matricula: { type: String, unique: true, sparse: true },
  foto: String,
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
