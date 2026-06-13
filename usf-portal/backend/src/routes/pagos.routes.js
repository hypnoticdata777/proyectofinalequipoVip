const router = require('express').Router();
const { listarPorAlumno, crearPago, marcarPagado } = require('../controllers/pagos.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/:alumnoId', verifyToken, listarPorAlumno);
router.post('/', verifyToken, checkRole('alumno', 'admin'), crearPago);
router.put('/:id/pagar', verifyToken, checkRole('admin'), marcarPagado);

module.exports = router;
