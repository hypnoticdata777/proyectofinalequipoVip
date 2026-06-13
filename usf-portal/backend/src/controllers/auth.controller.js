const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, matricula } = req.body;
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son obligatorios.' });
    }
    const existe = await User.findOne({ email });
    if (existe) return res.status(409).json({ error: 'El email ya está registrado.' });

    const usuario = await User.create({ nombre, apellido, email, password, rol, matricula });
    const token = generarToken(usuario);
    res.status(201).json({ token, usuario: { _id: usuario._id, nombre, apellido, email, rol: usuario.rol } });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });

    const usuario = await User.findOne({ email }).select('+password');
    if (!usuario || !usuario.password) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    const valida = await usuario.compararPassword(password);
    if (!valida) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = generarToken(usuario);
    res.json({ token, usuario: { _id: usuario._id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol } });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

const getMe = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id).select('-googleId -password');
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos del usuario.' });
  }
};

const logout = (req, res) => {
  res.status(200).json({ mensaje: 'Sesión cerrada exitosamente.' });
};

module.exports = { register, login, getMe, logout };
