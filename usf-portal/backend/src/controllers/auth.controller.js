// Controlador de autenticación (RF-01, RF-02).
// Gestiona registro, login y perfil usando JWT + bcrypt.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Genera un JWT con id, rol y nombre del usuario (expira en 24 h).
// Solo estos tres campos: suficiente para que cualquier middleware sepa quién es
// el usuario sin consultar la base de datos en cada petición (diseño stateless).
const generarToken = (user) => {
  return jwt.sign(
    { id: user._id, rol: user.rol, nombre: user.nombre }, // payload — no incluir datos sensibles (el payload es Base64, no encriptado)
    process.env.JWT_SECRET,                                // llave secreta desde .env — nunca hardcodeada en el código
    { expiresIn: '24h' }                                   // expiración: fuerza al cliente a re-autenticarse si la sesión es comprometida
  );
};

// POST /api/auth/register — crea un usuario nuevo con contraseña hasheada
const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, matricula } = req.body;

    // Verificar duplicado antes de crear — el índice unique del modelo lo atraparía
    // de todas formas, pero este check da un mensaje de error más claro al cliente.
    const existente = await User.findOne({ email });
    if (existente) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // bcrypt.hash() es deliberadamente lento (2^saltRounds iteraciones).
    // Eso es una ventaja: un atacante con GPU tardaría años en fuerza bruta.
    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hash = await bcrypt.hash(password, salt); // la contraseña original nunca se almacena

    const user = await User.create({ nombre, apellido, email, password: hash, rol, matricula });
    const token = generarToken(user);

    // 201 Created — el recurso (usuario) fue creado exitosamente.
    // Se devuelve el token de inmediato para que el cliente quede autenticado sin un segundo login.
    res.status(201).json({
      token,
      usuario: { id: user._id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol }
      // password excluido explícitamente — nunca debe viajar de vuelta al cliente
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login — verifica credenciales y devuelve JWT
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // Mismo mensaje para "email no existe" y "contraseña incorrecta" — previene
    // enumeración de usuarios: el atacante no puede saber si el email existe o no.
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    // bcrypt.compare() reconstruye el hash con el mismo salt y compara — nunca
    // desencripta la contraseña (bcrypt es unidireccional por diseño).
    const valido = await bcrypt.compare(password, user.password);
    if (!valido) return res.status(401).json({ message: 'Credenciales inválidas' });

    // La verificación de activo va después del compare para no revelar si el email
    // existe: un atacante con la contraseña correcta sí merece saber que está desactivado.
    // No se revela el motivo exacto del rechazo al cliente por seguridad
    if (!user.activo) return res.status(403).json({ message: 'Cuenta desactivada' });

    const token = generarToken(user);
    res.json({
      token,
      usuario: { id: user._id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me — devuelve el perfil del usuario autenticado (sin contraseña).
// req.user.id viene del JWT decodificado por verifyToken — no del body.
// Esta ruta la usan los frontends para obtener el _id de MongoDB del usuario logueado.
const me = async (req, res) => {
  try {
    // .select('-password') excluye el campo password del documento devuelto.
    // El prefijo '-' significa "todo menos este campo".
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/profesores — catálogo mínimo para asignar materias (solo admin).
// Protegida por verifyToken + checkRole('admin') en auth.routes.js.
const listarProfesores = async (req, res) => {
  try {
    const profesores = await User.find({ rol: 'profesor', activo: true })
      .select('nombre apellido email') // solo los campos necesarios — nunca exponer password ni datos internos
      .sort({ apellido: 1, nombre: 1 }); // orden alfabético para facilitar búsqueda visual
    res.json(profesores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password — reemplaza la contraseña si el email existe.
// Ruta pública (sin JWT) para recuperación de acceso — en producción requeriría
// un token de un solo uso enviado por email, pero en el MVP el admin lo gestiona.
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email y nueva contraseña son requeridos' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con ese email' });
    }
    const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    user.password = await bcrypt.hash(newPassword, salt); // siempre hashear — nunca guardar texto plano
    await user.save(); // .save() respeta los hooks y validaciones del schema de Mongoose
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, me, listarProfesores, resetPassword };
