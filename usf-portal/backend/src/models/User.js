const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { type: String, enum: ['alumno', 'profesor', 'admin'], default: 'alumno' },
  matricula: { type: String, unique: true, sparse: true },
  foto: String,
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.compararPassword = function (candidata) {
  return bcrypt.compare(candidata, this.password);
};

module.exports = mongoose.model('User', userSchema);
