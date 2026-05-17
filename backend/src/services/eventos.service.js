const supabase = require('./supabase');

// Público: solo eventos publicados
const getEventos = async () => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*, recintos(*)')
    .eq('estado', 'publicado')
    .order('fecha', { ascending: true });

  if (error) throw error;
  return data;
};

// Admin: todos los eventos sin importar estado
const getEventosAdmin = async () => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*, recintos(*)')
    .order('fecha', { ascending: true });

  if (error) throw error;
  return data;
};

const getEventoPorId = async (id) => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*, recintos(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
};

const crearEvento = async ({ nombre, fecha, recinto_id }) => {
  const { data, error } = await supabase
    .from('eventos')
    .insert({ nombre, fecha, recinto_id, estado: 'publicado' })
    .select('*, recintos(*)')
    .single();

  if (error) throw error;
  return data;
};

const actualizarEvento = async (id, cambios) => {
  const camposPermitidos = ['nombre', 'fecha', 'recinto_id', 'estado'];
  const actualizar = Object.fromEntries(
    Object.entries(cambios).filter(([k]) => camposPermitidos.includes(k))
  );

  const { data, error } = await supabase
    .from('eventos')
    .update(actualizar)
    .eq('id', id)
    .select('*, recintos(*)')
    .single();

  if (error) throw error;
  return data;
};

const eliminarEvento = async (id) => {
  const { error } = await supabase.from('eventos').delete().eq('id', id);
  if (error) throw error;
  return { mensaje: 'Evento eliminado correctamente' };
};

module.exports = { getEventos, getEventosAdmin, getEventoPorId, crearEvento, actualizarEvento, eliminarEvento };
