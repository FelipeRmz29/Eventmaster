const supabase = require('./supabase');

// Obtener todos los recintos
const getRecintos = async () => {
  const { data, error } = await supabase
    .from('recintos')
    .select('*');

  if (error) throw error;
  return data;
};

// Obtener un recinto por ID
const getRecintoPorId = async (id) => {
  const { data, error } = await supabase
    .from('recintos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Crear recinto Y generar asientos automáticamente
const crearRecinto = async (datos) => {
  const { nombre, direccion, filas, columnas, filasVIP } = datos;

  // 1. Calcular capacidad total
  const capacidad = filas * columnas;

  // 2. Crear el recinto
  const { data: recinto, error: errorRecinto } = await supabase
    .from('recintos')
    .insert({ nombre, direccion, capacidad })
    .select()
    .single();

  if (errorRecinto) throw errorRecinto;

  // 3. Generar los asientos automáticamente
  // Las filas se nombran con letras: A, B, C, D...
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const asientos = [];

  for (let f = 0; f < filas; f++) {
    const letraFila = letras[f]; // fila A, B, C...

    // Las primeras 'filasVIP' filas son VIP, el resto General
    const zona = f < filasVIP ? 'VIP' : 'General';

    for (let c = 1; c <= columnas; c++) {
      asientos.push({
        recinto_id: recinto.id,
        numero: c,
        fila: letraFila,
        zona: zona,
        estado: 'disponible' // todos empiezan disponibles
      });
    }
  }

  // 4. Insertar todos los asientos de una sola vez
  const { error: errorAsientos } = await supabase
    .from('asientos')
    .insert(asientos);

  if (errorAsientos) throw errorAsientos;

  // 5. Devolver el recinto con la cantidad de asientos generados
  return {
    ...recinto,
    asientos_generados: asientos.length
  };
};

// Actualizar un recinto
const actualizarRecinto = async (id, cambios) => {
  const { data, error } = await supabase
    .from('recintos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Eliminar un recinto
const eliminarRecinto = async (id) => {
  const { error } = await supabase
    .from('recintos')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { mensaje: 'Recinto eliminado correctamente' };
};

module.exports = {
  getRecintos,
  getRecintoPorId,
  crearRecinto,
  actualizarRecinto,
  eliminarRecinto
};