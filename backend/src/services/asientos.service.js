const supabase = require('./supabase');

// Obtener todos los asientos de un recinto con su estado
const getAsientosPorRecinto = async (recintoId) => {
  const { data, error } = await supabase
    .from('asientos')
    .select('*')
    .eq('recinto_id', recintoId)
    .order('fila', { ascending: true })      // ordena por fila A, B, C...
    .order('numero', { ascending: true });    // luego por número 1, 2, 3...

  if (error) throw error;
  return data;
};

// Actualizar estado de un asiento
const actualizarEstadoAsiento = async (id, estado) => {
  const estadosValidos = ['disponible', 'ocupado', 'reservado'];

  if (!estadosValidos.includes(estado)) {
    throw new Error(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('asientos')
    .update({ estado })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getAsientosPorRecinto,
  actualizarEstadoAsiento
};