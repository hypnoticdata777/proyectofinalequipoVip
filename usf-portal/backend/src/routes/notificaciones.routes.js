const router = require('express').Router();
const { listar, marcarLeida } = require('../controllers/notificaciones.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, listar);
router.put('/:id/leer', verifyToken, marcarLeida);

module.exports = router;
