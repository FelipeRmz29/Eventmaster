const ticketsService = require('../services/tickets.service');

// GET /tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketsService.getTicketById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /tickets/confirmar
const confirmarCompra = async (req, res) => {
  try {
    const { usuario_id, evento_id, asiento_id, precio } = req.body;

    // Validar que vienen todos los datos necesarios
    if (!usuario_id || !evento_id || !asiento_id || !precio) {
      return res.status(400).json({
        error: 'Faltan datos. Se requiere: usuario_id, evento_id, asiento_id, precio'
      });
    }

    const ticket = await ticketsService.confirmarCompra({
      usuario_id,
      evento_id,
      asiento_id,
      precio
    });

    res.status(201).json({
      mensaje: 'Compra confirmada exitosamente',
      ticket
    });

  } catch (error) {
    // Si el asiento ya fue tomado, mensaje amigable
    if (error.tipo === 'ASIENTO_NO_DISPONIBLE') {
      return res.status(409).json({
        error: 'Lo sentimos, ese asiento ya fue adquirido por otro usuario.'
      });
    }

    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTicketById,
  confirmarCompra
};