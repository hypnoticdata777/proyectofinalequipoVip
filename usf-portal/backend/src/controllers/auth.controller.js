const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generarToken = (user) => {
  return jwt.sign(
    { id: user._id, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, matricula } = req.body;

    const existente = await User.findOne({ email });
    if (existente) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ nombre, apellido, email, password: hash, rol, matricula });
    const token = generarToken(user);

    res.status(201).json({
      token,
      usuario: { id: user._id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const valido = await bcrypt.compare(password, user.password);
    if (!valido) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (!user.activo) {
      return res.status(403).json({ message: 'Cuenta desactivada' });
    }

    const token = generarToken(user);
    res.json({
      token,
      usuario: { id: user._id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, me };
