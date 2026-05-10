// src/services/ticketsService.js

const supabase = require('./supabase');
const redisClient = require('./redis');

const getTicketById = async (id) => {

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {

    // Si no encuentra el ticket
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  return data;
};

const comprarTicket = async ({
  usuario_id,
  evento_id,
  asiento_id,
  precio
}) => {

  const lockKey = `seat:${asiento_id}`;

  // LOCK REDIS
  const lock = await redisClient.set(
    lockKey,
    'locked',
    {
      NX: true,
      EX: 10
    }
  );

  // Si otro usuario ya está comprando el asiento
  if (!lock) {
    throw new Error('Asiento en proceso de compra');
  }

  try {

    // Buscar asiento
    const { data: asiento, error: asientoError } = await supabase
      .from('asientos')
      .select('*')
      .eq('id', asiento_id)
      .single();

    if (asientoError || !asiento) {
      throw new Error('Asiento no encontrado');
    }

    // Validar disponibilidad
    if (asiento.estado === 'ocupado') {
      throw new Error('El asiento ya no está disponible');
    }

    // Cambiar estado del asiento
    const { error: updateError } = await supabase
      .from('asientos')
      .update({
        estado: 'ocupado'
      })
      .eq('id', asiento_id);

    if (updateError) {
      throw updateError;
    }

    // Crear ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          usuario_id,
          evento_id,
          asiento_id,
          precio,
          estado: 'valido'
        }
      ])
      .select()
      .single();

    if (ticketError) {
      throw ticketError;
    }

    return {
      success: true,
      ticket
    };

  } finally {

    // Liberar lock Redis
    await redisClient.del(lockKey);
  }
};

module.exports = {
  getTicketById,
  comprarTicket
};