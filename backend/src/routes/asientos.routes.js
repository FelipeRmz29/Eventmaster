const express = require('express');
const router = express.Router();
const asientosController = require('../controllers/asientos.controller');

// GET /asientos/:recintoId → obtener asientos de un recinto
router.get('/:recintoId', asientosController.getAsientosPorRecinto);

// PATCH /asientos/:id/estado → actualizar estado de un asiento
router.patch('/:id/estado', asientosController.actualizarEstadoAsiento);

module.exports = router;