// src/controllers/tickets.controller.js

const ticketsService = require('../services/tickets.service');
const { generateTicketQR } = require('../services/qr.service');

const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketsService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    return res.json(ticket);
  } catch (error) {
    console.error('Error al obtener ticket:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const confirmarCompra = async (req, res) => {
  try {
    const { usuario_id, evento_id, asiento_id, precio } = req.body;
    if (!usuario_id || !evento_id || !asiento_id || precio === undefined || precio === null) {
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

    return res.status(201).json({ mensaje: 'Compra confirmada exitosamente', ticket });
  } catch (error) {
    if (error.tipo === 'ASIENTO_NO_DISPONIBLE') {
      return res.status(409).json({
        error: 'Lo sentimos, ese asiento ya fue adquirido por otro usuario.'
      });
    }
    console.error('Error confirmarCompra:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const comprarTicket = async (req, res) => {
  try {
    const { usuario_id, evento_id, asiento_id, precio } = req.body;
    const resultado = await ticketsService.comprarTicket({
      usuario_id,
      evento_id,
      asiento_id,
      precio
    });
    return res.status(201).json(resultado);
  } catch (error) {
    console.error('Error al comprar ticket:', error.message);
    return res.status(400).json({ error: error.message });
  }
};

const generarQR = async (req, res) => {
  try {
    const { ticket_id, evento, asiento, usuario } = req.body;
    if (!ticket_id || !evento) {
      return res.status(400).json({ error: 'Faltan datos del ticket' });
    }

    const { uuid, qrDataUrl } = await generateTicketQR({ ticket_id, evento, asiento, usuario });

    return res.status(200).json({ message: 'QR generado correctamente', uuid, qr: qrDataUrl });
  } catch (error) {
    console.error('Error generando QR:', error.message);
    return res.status(500).json({ error: 'Error al generar el QR' });
  }
};

module.exports = {
  getTicketById,
  confirmarCompra,
  comprarTicket,
  generarQR,
};
