const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const enviarTicketPorCorreo = async ({ email, nombre, pdfBuffer, ticketIds }) => {
  const idsLabel = Array.isArray(ticketIds) ? ticketIds.join(', ') : ticketIds;

  await transporter.sendMail({
    from: `"EventMaster" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Tu boleto EventMaster',
    html: `
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Gracias por tu compra. Adjunto encontrarás tu boleto en PDF con el código QR de acceso.</p>
      <p style="color:#6b7280;font-size:0.9rem;">Folio(s) de ticket: ${idsLabel}</p>
      <p>Preséntalo en la entrada del evento.</p>
      <br/>
      <p style="color:#6b7280;font-size:0.85rem;">EventMaster — Plataforma de gestión de eventos</p>
    `,
    attachments: [
      {
        filename: 'tickets-eventmaster.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
};

module.exports = { enviarTicketPorCorreo };
