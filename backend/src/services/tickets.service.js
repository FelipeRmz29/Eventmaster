const supabase = require('./supabase');
const { generarPDFTickets } = require('./pdf.service');
const { acquireSeatLock, releaseSeatLock } = require('./redis');
const { descifrarQR } = require('./crypto.service');
const { enviarTicketPorCorreo } = require('./mail.service');

const simularPago = async ({ total }) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const aprobado = Math.random() > 0.05; // demo: 95% éxito — en producción: llamada real a pasarela (Stripe, Conekta, etc.)
  const referencia = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return { aprobado, referencia };
};

const getTicketById = async (id) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
};

// asientos: [{ asiento_id, precio }] — máximo 2
const confirmarCompra = async ({ nombre, email, evento_id, asientos }) => {
  if (!Array.isArray(asientos) || asientos.length === 0) {
    throw Object.assign(new Error('Debes seleccionar al menos un asiento'), { tipo: 'VALIDACION' });
  }
  if (asientos.length > 2) {
    throw Object.assign(new Error('Máximo 2 asientos por compra'), { tipo: 'VALIDACION' });
  }

  // 1. Adquirir locks en orden para evitar deadlocks
  const idsLocked = [];
  for (const { asiento_id } of asientos) {
    const locked = await acquireSeatLock(asiento_id);
    if (!locked) {
      for (const id of idsLocked) await releaseSeatLock(id);
      throw Object.assign(
        new Error('Uno de los asientos está siendo procesado por otro usuario'),
        { tipo: 'ASIENTO_NO_DISPONIBLE' }
      );
    }
    idsLocked.push(asiento_id);
  }

  try {
    // 2. Verificar disponibilidad de todos los asientos
    for (const { asiento_id } of asientos) {
      const { data: asiento, error } = await supabase
        .from('asientos').select('estado').eq('id', asiento_id).single();
      if (error) throw error;
      if (asiento.estado !== 'disponible') {
        throw Object.assign(
          new Error('Uno de los asientos ya no está disponible'),
          { tipo: 'ASIENTO_NO_DISPONIBLE' }
        );
      }
    }

    // 3. Simular pago
    const total = asientos.reduce((sum, a) => sum + Number(a.precio), 0);
    const pago = await simularPago({ total });
    if (!pago.aprobado) {
      throw Object.assign(
        new Error('El pago fue rechazado. Intenta nuevamente.'),
        { tipo: 'PAGO_RECHAZADO' }
      );
    }

    // 4. Marcar todos los asientos como ocupados
    for (const { asiento_id } of asientos) {
      const { error } = await supabase
        .from('asientos').update({ estado: 'ocupado' }).eq('id', asiento_id);
      if (error) throw error;
    }

    // 5. Crear un ticket por asiento
    const ticketsCreados = [];
    for (const { asiento_id, precio } of asientos) {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          nombre_comprador: nombre,
          email_comprador: email,
          evento_id,
          asiento_id,
          precio,
          estado: 'activo',
          usado_en: null,
        })
        .select('*, asientos(fila, numero, zona), eventos(nombre, fecha)')
        .single();

      if (error) {
        // Revertir asientos si falla la inserción
        for (const { asiento_id: aid } of asientos) {
          await supabase.from('asientos').update({ estado: 'disponible' }).eq('id', aid);
        }
        throw error;
      }
      ticketsCreados.push(ticket);
    }

    // 6. Generar PDF con todos los tickets
    const pdfBuffer = await generarPDFTickets(ticketsCreados);

    // 7. Enviar PDF por correo (no bloquea si falla)
    enviarTicketPorCorreo({
      email,
      nombre,
      pdfBuffer,
      ticketIds: ticketsCreados.map(t => t.id),
    }).catch(err => console.error('Error al enviar correo:', err.message));

    return { tickets: ticketsCreados, pdfBuffer, referenciaPago: pago.referencia };
  } finally {
    for (const id of idsLocked) await releaseSeatLock(id);
  }
};

const validarTicket = async (tokenQR) => {
  let ticketId;
  try {
    ticketId = descifrarQR(tokenQR);
  } catch {
    return { resultado: 'FALSO' };
  }

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*, asientos(fila, numero, zona), eventos(nombre, fecha)')
    .eq('id', ticketId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return { resultado: 'FALSO' };
    throw error;
  }

  if (!ticket) return { resultado: 'FALSO' };

  if (ticket.estado === 'usado') {
    return {
      resultado: 'YA_USADO',
      usado_en: ticket.usado_en,
      ticket: {
        id: ticket.id,
        nombre_comprador: ticket.nombre_comprador,
        evento: ticket.eventos?.nombre,
        asiento: `${ticket.asientos?.fila}${ticket.asientos?.numero}`,
        zona: ticket.asientos?.zona,
      },
    };
  }

  if (ticket.estado === 'activo') {
    const usado_en = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ estado: 'usado', usado_en })
      .eq('id', ticketId)
      .eq('estado', 'activo');

    if (updateError) throw updateError;

    return {
      resultado: 'VALIDO',
      ticket: {
        id: ticket.id,
        nombre_comprador: ticket.nombre_comprador,
        evento: ticket.eventos?.nombre,
        fecha: ticket.eventos?.fecha,
        asiento: `${ticket.asientos?.fila}${ticket.asientos?.numero}`,
        zona: ticket.asientos?.zona,
        precio: ticket.precio,
      },
    };
  }

  return { resultado: 'FALSO' };
};

module.exports = { getTicketById, confirmarCompra, validarTicket };
