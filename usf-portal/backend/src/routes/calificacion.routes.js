const express = require('express');
const router = express.Router();
const { getMiGrupo, actualizarCalificacion, cerrarActa, getCalificacionesAlumno } = require('../controllers/calificacion.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/mi-grupo/:materiaId', verifyToken, checkRole(['profesor']), getMiGrupo);
router.put('/:id', verifyToken, checkRole(['profesor', 'admin']), actualizarCalificacion);
router.put('/:id/cerrar', verifyToken, checkRole(['admin']), cerrarActa);
router.get('/alumno/:alumnoId', verifyToken, getCalificacionesAlumno);

module.exports = router;
