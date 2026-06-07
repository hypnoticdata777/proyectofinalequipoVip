const router = require('express').Router();
const { kardex } = require('../controllers/historial.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/:alumnoId', verifyToken, kardex);

module.exports = router;
