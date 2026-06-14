const router = require('express').Router();
const { inscribir, obtener, cancelar, obtenerTodas } = require('../controllers/inscripciones.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/', verifyToken, checkRole('admin'), obtenerTodas);
router.post('/', verifyToken, checkRole('alumno'), inscribir);
router.get('/:id', verifyToken, obtener);
router.delete('/:id', verifyToken, checkRole('alumno'), cancelar);

module.exports = router;
