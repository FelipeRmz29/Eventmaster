// src/services/ticketsService.js

const supabase = require('./supabase'); // Tu cliente de Supabase ya configurado

const getTicketById = async (id) => {
  const { data, error } = await supabase
    .from('tickets')      // Tabla a consultar
    .select('*')          // Trae todas las columnas
    .eq('id', id)         // WHERE id = :id
    .single();            // Espera exactamente un resultado (devuelve null si no existe)

  if (error) {
    // .single() lanza error si no encuentra nada — lo ignoramos aquí
    // y dejamos que el controlador maneje el null
    if (error.code === 'PGRST116') return null; // Código de Supabase: "no rows found"
    throw error; // Cualquier otro error sí lo lanzamos
  }

  return data; // Devuelve el objeto ticket
};

module.exports = { getTicketById };