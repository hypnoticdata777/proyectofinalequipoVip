const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// RF-02: Registro de usuarios con roles
router.post('/register', register);

// RF-01: Login con email/password + JWT
router.post('/login', login);

// RF-06: Consultar perfil autenticado
router.get('/me', verifyToken, getMe);

router.post('/logout', verifyToken, logout);

module.exports = router;
