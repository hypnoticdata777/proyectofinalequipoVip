const express = require('express');
const router = express.Router();
const { listarAdeudos, crearAdeudo, marcarPagado, getMisAdeudos } = require('../controllers/adeudo.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/', verifyToken, checkRole(['admin']), listarAdeudos);
router.post('/', verifyToken, checkRole(['admin']), crearAdeudo);
router.put('/:id/pagado', verifyToken, checkRole(['admin']), marcarPagado);
router.get('/mis-adeudos', verifyToken, checkRole(['alumno']), getMisAdeudos);

module.exports = router;
