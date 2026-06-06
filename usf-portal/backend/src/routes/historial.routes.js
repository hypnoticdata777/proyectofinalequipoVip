const express = require('express');
const router = express.Router();
const { getHistorial, generarPDF } = require('../controllers/historial.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/:alumnoId', verifyToken, getHistorial);
router.get('/:alumnoId/pdf', verifyToken, generarPDF);

module.exports = router;
