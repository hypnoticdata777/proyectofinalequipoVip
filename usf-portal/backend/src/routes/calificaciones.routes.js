const router = require('express').Router();
const { verPorMateria, registrar, misCalificaciones } = require('../controllers/calificaciones.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/mis-calificaciones', verifyToken, checkRole('alumno'), misCalificaciones);
router.get('/:materiaId', verifyToken, verPorMateria);
router.put('/:id', verifyToken, checkRole('profesor'), registrar);

module.exports = router;
