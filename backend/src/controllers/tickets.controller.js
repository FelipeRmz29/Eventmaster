const ticketsService = require('../services/tickets.service');

const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketsService.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /tickets/confirmar
// Body: { nombre, email, evento_id, asientos: [{ asiento_id, precio }] }  — máx 2
const confirmarCompra = async (req, res) => {
  try {
    const { nombre, email, evento_id, asientos } = req.body;

    if (!nombre || !email || !evento_id || !asientos) {
      return res.status(400).json({
        error: 'Faltan datos. Se requiere: nombre, email, evento_id, asientos'
      });
    }
    if (!Array.isArray(asientos) || asientos.length === 0) {
      return res.status(400).json({ error: 'asientos debe ser un array no vacío' });
    }
    if (asientos.length > 2) {
      return res.status(400).json({ error: 'Máximo 2 asientos por compra' });
    }

    const { tickets, pdfBuffer, referenciaPago } = await ticketsService.confirmarCompra({
      nombre, email, evento_id, asientos
    });

    const ticketIds = tickets.map(t => t.id).join(',');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="tickets-eventmaster.pdf"',
      'Content-Length': pdfBuffer.length,
      'X-Ticket-Ids': ticketIds,
      'X-Referencia-Pago': referenciaPago,
    });

    return res.send(pdfBuffer);

  } catch (error) {
    if (error.tipo === 'ASIENTO_NO_DISPONIBLE') {
      return res.status(409).json({ error: error.message });
    }
    if (error.tipo === 'PAGO_RECHAZADO') {
      return res.status(402).json({ error: error.message });
    }
    if (error.tipo === 'VALIDACION') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

const validarTicket = async (req, res) => {
  try {
    const { ticket_id } = req.body;
    if (!ticket_id) return res.status(400).json({ error: 'Se requiere ticket_id' });
    const resultado = await ticketsService.validarTicket(ticket_id);
    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getTicketById, confirmarCompra, validarTicket };
