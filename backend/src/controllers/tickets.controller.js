const { generateTicketQR } = require('../services/qr.service');

// POST /tickets/qr
const generarQR = async (req, res) => {
  try {
    const { ticket_id, evento, asiento, usuario } = req.body;

    if (!ticket_id || !evento) {
      return res.status(400).json({ error: 'Faltan datos del ticket' });
    }

    const { uuid, qrDataUrl } = await generateTicketQR({
      ticket_id,
      evento,
      asiento,
      usuario,
    });

    return res.status(200).json({
      message: 'QR generado correctamente',
      uuid,
      qr: qrDataUrl, // imagen base64 lista para el frontend
    });
  } catch (error) {
    console.error('Error generando QR:', error.message);
    return res.status(500).json({ error: 'Error al generar el QR' });
  }
};

module.exports = {
  getTicketById,
  confirmarCompra,
  comprarTicket,
  generarQR, // <-- agrega este
};