// src/controllers/ticketsController.js

const ticketsService = require('../services/tickets.service'); // Importa el servicio

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params; // Extrae el :id de la URL (ej: /tickets/5 → id = "5")

    const ticket = await ticketsService.getTicketById(id); // Llama al servicio

    if (!ticket) {
      // Si el servicio devuelve null, el ticket no existe
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.status(200).json(ticket); // Todo bien → devuelve el ticket
  } catch (error) {
    console.error('Error al obtener ticket:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getTicketById };