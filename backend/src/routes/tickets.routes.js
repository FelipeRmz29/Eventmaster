// src/routes/tickets.js

const express = require('express');
const router = express.Router(); // Crea un mini-servidor de rutas
const ticketsController = require('../controllers/tickets.controller.js'); // Importa el controlador

router.get('/:id', ticketsController.getTicketById); // GET /tickets/:id

module.exports = router;