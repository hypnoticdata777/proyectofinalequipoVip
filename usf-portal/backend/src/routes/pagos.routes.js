const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const { listarPagos, crearPago, actualizarEstadoPago, generarReferenciaPDF } = require('../controllers/pagos.controller');

router.use(verifyToken);

// RF-30: CRUD de pagos
router.get('/', listarPagos);
router.post('/', checkRole(['alumno', 'admin']), crearPago);
router.put('/:id', checkRole(['admin']), actualizarEstadoPago);

// RF-31: Referencia bancaria PDF
router.post('/referencia', checkRole(['alumno']), generarReferenciaPDF);

module.exports = router;
