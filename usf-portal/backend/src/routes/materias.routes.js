const router = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../controllers/materias.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/', verifyToken, listar);
router.post('/', verifyToken, checkRole('admin'), crear);
router.put('/:id', verifyToken, checkRole('admin'), actualizar);
router.delete('/:id', verifyToken, checkRole('admin'), eliminar);

module.exports = router;
