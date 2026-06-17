const router = require('express').Router();
const { verPorMateria, misCalificaciones } = require('../controllers/calificaciones.controller');
const { getMiGrupo, actualizarCalificacion, cerrarActa, getCalificacionesAlumno } = require('../controllers/calificacion.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// Rutas específicas primero para evitar conflictos con parámetros genéricos
router.get('/mis-calificaciones', verifyToken, checkRole(['alumno']), misCalificaciones);
router.get('/mi-grupo/:materiaId', verifyToken, checkRole(['profesor']), getMiGrupo);
router.get('/alumno/:alumnoId', verifyToken, getCalificacionesAlumno);

router.put('/:id/cerrar', verifyToken, checkRole(['admin']), cerrarActa);
router.put('/:id', verifyToken, checkRole(['profesor', 'admin']), actualizarCalificacion);

// Ruta genérica al final para no interferir con las específicas
router.get('/:materiaId', verifyToken, verPorMateria);

module.exports = router;
