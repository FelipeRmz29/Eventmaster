const supabase = require("./supabase");
const redisClient = require("./redis");

const getTicketById = async (id) => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
};

const confirmarCompra = async ({ usuario_id, evento_id, asiento_id, precio }) => {
  const { data: asiento, error: errorAsiento } = await supabase
    .from("asientos")
    .select("estado")
    .eq("id", asiento_id)
    .single();

  if (errorAsiento) throw errorAsiento;

  if (asiento.estado !== "disponible") {
    const error = new Error("El asiento ya no esta disponible");
    error.tipo = "ASIENTO_NO_DISPONIBLE";
    throw error;
  }

  const { error: errorUpdate } = await supabase
    .from("asientos")
    .update({ estado: "ocupado" })
    .eq("id", asiento_id);

  if (errorUpdate) throw errorUpdate;

  const { data: ticket, error: errorTicket } = await supabase
    .from("tickets")
    .insert({
      usuario_id,
      evento_id,
      asiento_id,
      precio,
      estado: "valido",
      usado_en: null,
    })
    .select(`
      *,
      asientos (fila, numero, zona),
      eventos (nombre, fecha)
    `)
    .single();

  if (errorTicket) {
    await supabase
      .from("asientos")
      .update({ estado: "disponible" })
      .eq("id", asiento_id);

    throw errorTicket;
  }

  return ticket;
};

const comprarTicket = async ({ usuario_id, evento_id, asiento_id, precio }) => {
  const lockKey = `seat:${asiento_id}`;
  let lock = true;

  if (redisClient?.isOpen) {
    lock = await redisClient.set(lockKey, "locked", {
      NX: true,
      EX: 10,
    });
  }

  if (!lock) {
    throw new Error("Asiento en proceso de compra");
  }

  try {
    const ticket = await confirmarCompra({
      usuario_id,
      evento_id,
      asiento_id,
      precio,
    });

    return {
      success: true,
      ticket,
    };
  } finally {
    if (redisClient?.isOpen) {
      await redisClient.del(lockKey);
    }
  }
};

module.exports = {
  getTicketById,
  confirmarCompra,
  comprarTicket,
};
