const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { cifrarQR } = require('./crypto.service');

const renderTicketPage = async (doc, ticket) => {
  const qrPayload = cifrarQR(ticket.id);
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 200, margin: 1 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  doc.fontSize(28).font('Helvetica-Bold').text('EventMaster', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Boleto de Acceso', { align: 'center' });
  doc.moveDown(1.5);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(18).font('Helvetica-Bold').text('Evento');
  doc.fontSize(14).font('Helvetica').text(ticket.eventos?.nombre || 'Sin nombre');
  const fecha = ticket.eventos?.fecha
    ? new Date(ticket.eventos.fecha).toLocaleString('es-MX')
    : 'Sin fecha';
  doc.fontSize(12).text(`Fecha: ${fecha}`);
  doc.moveDown(1);

  doc.fontSize(18).font('Helvetica-Bold').text('Comprador');
  doc.fontSize(14).font('Helvetica').text(ticket.nombre_comprador || '-');
  doc.fontSize(12).text(ticket.email_comprador || '-');
  doc.moveDown(1);

  doc.fontSize(18).font('Helvetica-Bold').text('Asiento');
  doc.fontSize(14).font('Helvetica').text(`Fila: ${ticket.asientos?.fila || '-'}`);
  doc.text(`Número: ${ticket.asientos?.numero || '-'}`);
  doc.text(`Zona: ${ticket.asientos?.zona || '-'}`);
  doc.text(`Precio: $${ticket.precio}`);
  doc.moveDown(1);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(14).font('Helvetica-Bold').text('Código QR de acceso', { align: 'center' });
  doc.moveDown(0.5);

  const qrX = (doc.page.width - 150) / 2;
  doc.image(qrBuffer, qrX, doc.y, { width: 150 });
  doc.moveDown(8);

  doc.fontSize(10).font('Helvetica').fillColor('grey')
    .text(`ID de ticket: ${ticket.id}`, { align: 'center' });
  doc.text('Presenta este código QR en la entrada del evento.', { align: 'center' });
  doc.fillColor('black');
};

const generarPDFTickets = async (tickets) => {
  const lista = Array.isArray(tickets) ? tickets : [tickets];

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const renderAll = async () => {
      for (let i = 0; i < lista.length; i++) {
        if (i > 0) doc.addPage();
        await renderTicketPage(doc, lista[i]);
      }
      doc.end();
    };

    renderAll().catch(reject);
  });
};

module.exports = { generarPDFTickets };
