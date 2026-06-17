const router = require('express').Router();
const { listar, marcarLeida, streamNotificaciones } = require('../controllers/notificaciones.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/stream', streamNotificaciones);
router.get('/', verifyToken, listar);
router.put('/:id/leer', verifyToken, marcarLeida);

module.exports = router;
