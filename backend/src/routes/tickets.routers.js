tickets.routers.js
const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/tickets.controller');

router.get('/:id', ticketsController.getTicketById);
router.post('/confirmar', ticketsController.confirmarCompra);
router.post('/compra', ticketsController.comprarTicket);
router.post('/qr', ticketsController.generarQR); // <-- nuevo

module.exports = router;