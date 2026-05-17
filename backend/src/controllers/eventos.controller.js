const eventosService = require("../services/eventos.service");

const getEventos = async (req, res) => {
  try {
    const eventos = await eventosService.getEventos();
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventoPorId = async (req, res) => {
  try {
    const evento = await eventosService.getEventoPorId(req.params.id);
    res.json(evento);
  } catch {
    res.status(404).json({ error: "Evento no encontrado" });
  }
};

module.exports = {
  getEventos,
  getEventoPorId,
};
