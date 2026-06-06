const express = require('express');
const router = express.Router();
const { crearInscripcion, getMiInscripcion, listarInscripciones, cancelarInscripcion } = require('../controllers/inscripcion.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.post('/', verifyToken, checkRole(['alumno']), crearInscripcion);
router.get('/mi-inscripcion', verifyToken, checkRole(['alumno']), getMiInscripcion);
router.get('/', verifyToken, checkRole(['admin']), listarInscripciones);
router.put('/:id/cancelar', verifyToken, checkRole(['admin']), cancelarInscripcion);

module.exports = router;
