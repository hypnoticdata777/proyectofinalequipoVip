const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre:       { type: String, required: true },
  apellido:     { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true },
  rol:          { type: String, enum: ['alumno', 'profesor', 'admin'], default: 'alumno' },
  matricula:    { type: String },
  foto:         { type: String },
  activo:       { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
