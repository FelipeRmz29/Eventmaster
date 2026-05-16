// src/routes/tickets.js

const express = require('express');
const router = express.Router();

const ticketsController = require('../controllers/tickets.controller.js');

router.get('/:id', ticketsController.getTicketById);

router.post('/compra', ticketsController.comprarTicket);

module.exports = router;