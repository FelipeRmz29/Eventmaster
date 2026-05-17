const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/tickets.controller');
const verifyToken = require('../middleware/authMiddleware');

// POST /tickets/confirmar → confirmar compra y generar PDF
router.post('/confirmar', ticketsController.confirmarCompra);

// POST /tickets/validar → validar QR en entrada (requiere token de admin)
router.post('/validar', verifyToken, ticketsController.validarTicket);

// GET /tickets/:id → obtener ticket por ID
router.get('/:id', ticketsController.getTicketById);

module.exports = router;
