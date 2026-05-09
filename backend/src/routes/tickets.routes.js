const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/tickets.controller');

// GET /tickets/:id → obtener ticket por ID
router.get('/:id', ticketsController.getTicketById);

// POST /tickets/confirmar → confirmar compra y crear ticket
router.post('/confirmar', ticketsController.confirmarCompra);

module.exports = router;