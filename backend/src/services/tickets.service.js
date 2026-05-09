const supabase = require('./supabase');

// Obtener ticket por ID
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

// Confirmar compra y crear ticket
const confirmarCompra = async ({ usuario_id, evento_id, asiento_id, precio }) => {

  // 1. Verificar que el asiento sigue disponible
  const { data: asiento, error: errorAsiento } = await supabase
    .from('asientos')
    .select('estado')
    .eq('id', asiento_id)
    .single();

  if (errorAsiento) throw errorAsiento;

  if (asiento.estado !== 'disponible') {
    const err = new Error('El asiento ya no está disponible');
    err.tipo = 'ASIENTO_NO_DISPONIBLE';
    throw err;
  }

  // 2. Marcar el asiento como ocupado
  const { error: errorUpdate } = await supabase
    .from('asientos')
    .update({ estado: 'ocupado' })
    .eq('id', asiento_id);

  if (errorUpdate) throw errorUpdate;

  // 3. Crear el ticket
  const { data: ticket, error: errorTicket } = await supabase
    .from('tickets')
    .insert({
      usuario_id,
      evento_id,
      asiento_id,
      precio,
      estado: 'valido',
      usado_en: null
    })
    .select(`
      *,
      asientos (fila, numero, zona),
      eventos (nombre, fecha)
    `)
    .single();

  if (errorTicket) {
    // Revertir el asiento a disponible antes de lanzar el error
    await supabase
      .from('asientos')
      .update({ estado: 'disponible' })
      .eq('id', asiento_id);

    throw errorTicket;
  }

  return ticket;
};

module.exports = {
  getTicketById,
  confirmarCompra
};  