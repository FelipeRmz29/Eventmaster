const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventos.controller');
const verifyToken = require('../middleware/authMiddleware');

// Públicas
router.get('/', eventosController.getEventos);
router.get('/:id', eventosController.getEventoPorId);

// Protegidas (admin)
router.get('/admin/all', verifyToken, eventosController.getEventosAdmin);
router.post('/', verifyToken, eventosController.crearEvento);
router.put('/:id', verifyToken, eventosController.actualizarEvento);
router.delete('/:id', verifyToken, eventosController.eliminarEvento);

module.exports = router;
