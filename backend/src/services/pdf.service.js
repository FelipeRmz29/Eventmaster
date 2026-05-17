const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const generarPDFTicket = async (ticket) => {
  // ticket debe tener: id, precio, estado,
  // asientos: { fila, numero, zona }
  // eventos: { nombre, fecha }

  // 1. Generar el QR como imagen en base64
  // El QR contendrá el ID del ticket para que el guardia lo escanee
  const qrDataUrl = await QRCode.toDataURL(String(ticket.id), {
    width: 200,       // tamaño en píxeles
    margin: 1,        // margen alrededor del QR
  });

  // Convertir base64 a Buffer para que PDFKit pueda usarlo
  const qrBase64 = qrDataUrl.split(',')[1];
  const qrBuffer = Buffer.from(qrBase64, 'base64');

  // 2. Crear el documento PDF
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    // Recolectar los chunks del PDF en memoria
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // ── ENCABEZADO ──────────────────────────────────────
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('EventMaster', { align: 'center' });

    doc
      .fontSize(14)
      .font('Helvetica')
      .text('Boleto de Acceso', { align: 'center' });

    doc.moveDown(1.5);

    // Línea separadora
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1);

    // ── DATOS DEL EVENTO ────────────────────────────────
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Evento');

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(ticket.eventos?.nombre || 'Sin nombre');

    const fecha = ticket.eventos?.fecha
      ? new Date(ticket.eventos.fecha).toLocaleString('es-MX')
      : 'Sin fecha';

    doc
      .fontSize(12)
      .text(`Fecha: ${fecha}`);

    doc.moveDown(1);

    // ── DATOS DEL ASIENTO ───────────────────────────────
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Asiento');

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(`Fila: ${ticket.asientos?.fila || '-'}`);

    doc.text(`Número: ${ticket.asientos?.numero || '-'}`);
    doc.text(`Zona: ${ticket.asientos?.zona || '-'}`);
    doc.text(`Precio: $${ticket.precio}`);

    doc.moveDown(1);

    // Línea separadora
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1);

    // ── CÓDIGO QR ───────────────────────────────────────
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Código QR de acceso', { align: 'center' });

    doc.moveDown(0.5);

    // Insertar la imagen del QR centrada
    const qrX = (doc.page.width - 150) / 2;
    doc.image(qrBuffer, qrX, doc.y, { width: 150 });

    doc.moveDown(8);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('grey')
      .text(`ID de ticket: ${ticket.id}`, { align: 'center' });

    doc
      .text('Presenta este código QR en la entrada del evento.', { align: 'center' });

    // Finalizar el documento
    doc.end();
  });
};

module.exports = { generarPDFTicket };