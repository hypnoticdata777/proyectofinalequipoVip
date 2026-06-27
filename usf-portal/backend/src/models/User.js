// Modelo de usuario — soporta los tres roles del sistema: alumno, profesor, admin.
// La contraseña siempre se almacena hasheada (bcrypt) antes de llegar aquí.
// Este modelo es la fuente de verdad de identidad para todo el sistema.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre:    { type: String, required: true },
  apellido:  { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true }, // lowercase evita duplicados por mayúsculas ("User@" vs "user@")
  password:  { type: String, required: true },  // siempre el hash bcrypt, nunca texto plano
  rol:       { type: String, enum: ['alumno', 'profesor', 'admin'], default: 'alumno' }, // enum: MongoDB rechaza cualquier otro valor
  matricula: { type: String }, // Solo alumnos; undefined para profesores y admins
  foto:      { type: String }, // URL de foto de perfil (opcional)
  activo:    { type: Boolean, default: true }, // baja lógica — desactivar sin borrar preserva el historial académico
}, { timestamps: true }); // timestamps: agrega createdAt y updatedAt automáticamente en cada documento

module.exports = mongoose.model('User', userSchema);
