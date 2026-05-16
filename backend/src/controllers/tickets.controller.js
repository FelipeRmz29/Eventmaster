// src/controllers/ticketsController.js

const ticketsService = require('../services/tickets.service');

const getTicketById = async (req, res) => {

  try {

    const { id } = req.params;

    const ticket = await ticketsService.getTicketById(id);

    if (!ticket) {

      return res.status(404).json({
        error: 'Ticket no encontrado'
      });
    }

    res.status(200).json(ticket);

  } catch (error) {

    console.error('Error al obtener ticket:', error.message);

    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const comprarTicket = async (req, res) => {

  try {

    const {
      usuario_id,
      evento_id,
      asiento_id,
      precio
    } = req.body;

    const resultado = await ticketsService.comprarTicket({
      usuario_id,
      evento_id,
      asiento_id,
      precio
    });

    res.status(201).json(resultado);

  } catch (error) {

    console.error('Error al comprar ticket:', error.message);

    res.status(400).json({
      error: error.message
    });
  }
};

module.exports = {
  getTicketById,
  comprarTicket
};