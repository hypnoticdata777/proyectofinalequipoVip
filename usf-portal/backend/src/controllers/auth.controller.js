const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, foto: usuario.foto },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const iniciarGoogle = passport.authenticate('google', { scope: ['profile', 'email'] });

const callbackGoogle = (req, res) => {
  try {
    const token = generarToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=auth_fallido`);
  }
};

const getMe = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id).select('-googleId');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos del usuario.' });
  }
};

const logout = (req, res) => {
  res.status(200).json({ mensaje: 'Sesión cerrada exitosamente.' });
};

module.exports = { iniciarGoogle, callbackGoogle, getMe, logout };
