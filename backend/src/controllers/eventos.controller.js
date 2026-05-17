const eventosService = require('../services/eventos.service');

const getEventos = async (req, res) => {
  try {
    const eventos = await eventosService.getEventos();
    return res.json(eventos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getEventosAdmin = async (req, res) => {
  try {
    const eventos = await eventosService.getEventosAdmin();
    return res.json(eventos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getEventoPorId = async (req, res) => {
  try {
    const evento = await eventosService.getEventoPorId(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    return res.json(evento);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const crearEvento = async (req, res) => {
  try {
    const { nombre, fecha, recinto_id } = req.body;
    if (!nombre || !fecha) {
      return res.status(400).json({ error: 'Se requiere nombre y fecha' });
    }
    const evento = await eventosService.crearEvento({ nombre, fecha, recinto_id: recinto_id || null });
    return res.status(201).json(evento);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const actualizarEvento = async (req, res) => {
  try {
    const evento = await eventosService.actualizarEvento(req.params.id, req.body);
    return res.json(evento);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const eliminarEvento = async (req, res) => {
  try {
    const result = await eventosService.eliminarEvento(req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getEventos, getEventosAdmin, getEventoPorId, crearEvento, actualizarEvento, eliminarEvento };
