const router = require('express').Router();
const { register, login, me, listarProfesores, resetPassword } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.post('/register', register);
router.post('/login', login);
router.get('/profesores', verifyToken, checkRole('admin'), listarProfesores);
router.get('/me', verifyToken, me);
router.post('/reset-password', resetPassword);

module.exports = router;
