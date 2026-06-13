const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getMisNotificaciones, marcarLeida, marcarTodasLeidas } = require('../controllers/notificaciones.controller');

router.use(verifyToken);

router.get('/', getMisNotificaciones);
router.put('/leidas', marcarTodasLeidas);
router.put('/:id/leida', marcarLeida);

module.exports = router;
