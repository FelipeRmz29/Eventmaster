const asientosService = require('../services/asientos.service');

// GET /asientos/:recintoId
const getAsientosPorRecinto = async (req, res) => {
  try {
    const asientos = await asientosService.getAsientosPorRecinto(req.params.recintoId);
    res.json(asientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /asientos/:id/estado
const actualizarEstadoAsiento = async (req, res) => {
  try {
    const { estado } = req.body;
    const asiento = await asientosService.actualizarEstadoAsiento(req.params.id, estado);
    res.json(asiento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAsientosPorRecinto,
  actualizarEstadoAsiento
};