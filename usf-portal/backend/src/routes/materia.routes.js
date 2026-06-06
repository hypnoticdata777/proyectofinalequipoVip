const express = require('express');
const router = express.Router();
const { listarMaterias, crearMateria, actualizarMateria, obtenerMateria } = require('../controllers/materia.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/', verifyToken, listarMaterias);
router.get('/:id', verifyToken, obtenerMateria);
router.post('/', verifyToken, checkRole(['admin']), crearMateria);
router.put('/:id', verifyToken, checkRole(['admin']), actualizarMateria);

module.exports = router;
