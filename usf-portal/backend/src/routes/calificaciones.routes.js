const router = require('express').Router();
const { verPorMateria, registrar } = require('../controllers/calificaciones.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/:materiaId', verifyToken, verPorMateria);
router.put('/:id', verifyToken, checkRole('profesor'), registrar);

module.exports = router;
