const supabase = require("./supabase");

const EVENT_SELECT = `
  *,
  recintos (
    id,
    nombre,
    direccion,
    capacidad
  )
`;

const getEventos = async () => {
  const { data, error } = await supabase
    .from("eventos")
    .select(EVENT_SELECT)
    .order("fecha", { ascending: true });

  if (error) throw error;
  return data;
};

const getEventoPorId = async (id) => {
  const { data, error } = await supabase
    .from("eventos")
    .select(EVENT_SELECT)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getEventos,
  getEventoPorId,
};
