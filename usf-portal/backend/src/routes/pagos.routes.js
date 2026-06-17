const router = require('express').Router();
const { listarPorAlumno, misPagos, crearPago, marcarPagado } = require('../controllers/pagos.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/mis-pagos', verifyToken, checkRole(['alumno']), misPagos);
router.get('/:alumnoId', verifyToken, checkRole(['admin']), listarPorAlumno);
router.post('/', verifyToken, checkRole(['admin']), crearPago);
router.put('/:id/pagar', verifyToken, checkRole(['admin']), marcarPagado);

module.exports = router;
