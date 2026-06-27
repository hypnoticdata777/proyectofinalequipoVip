// Rutas de autenticación — montadas en /api/auth desde app.js
// La cadena de middleware se lee de izquierda a derecha:
// si verifyToken falla → para ahí; si checkRole falla → para ahí; si pasa → llega al controller.
const router = require('express').Router();
const { register, login, me, listarProfesores, resetPassword } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.post('/register', register);                                        // pública — cualquiera puede registrarse
router.post('/login', login);                                              // pública — entry point del sistema
router.get('/me', verifyToken, me);                                        // requiere sesión activa (cualquier rol)
router.get('/profesores', verifyToken, checkRole('admin'), listarProfesores); // solo admin — doble barrera
router.post('/reset-password', resetPassword);                             // pública — MVP sin token de email

module.exports = router;
