// Modelo de usuario — soporta los tres roles del sistema: alumno, profesor, admin.
// La contraseña siempre se almacena hasheada (bcrypt) antes de llegar aquí.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre:    { type: String, required: true },
  apellido:  { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  rol:       { type: String, enum: ['alumno', 'profesor', 'admin'], default: 'alumno' },
  matricula: { type: String }, // Solo alumnos; undefined para profesores y admins
  foto:      { type: String }, // URL de foto de perfil (opcional)
  activo:    { type: Boolean, default: true }, // Permite deshabilitar sin borrar
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
