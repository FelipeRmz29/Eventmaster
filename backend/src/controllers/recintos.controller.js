const recintosService = require('../services/recintos.service');

// GET /recintos
const getRecintos = async (req, res) => {
  try {
    const recintos = await recintosService.getRecintos();
    res.json(recintos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /recintos/:id
const getRecintoPorId = async (req, res) => {
  try {
    const recinto = await recintosService.getRecintoPorId(req.params.id);
    res.json(recinto);
  } catch (error) {
    res.status(404).json({ error: 'Recinto no encontrado' });
  }
};

// POST /recintos
const crearRecinto = async (req, res) => {
  try {
    const recinto = await recintosService.crearRecinto(req.body);
    res.status(201).json(recinto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /recintos/:id
const actualizarRecinto = async (req, res) => {
  try {
    const recinto = await recintosService.actualizarRecinto(req.params.id, req.body);
    res.json(recinto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /recintos/:id
const eliminarRecinto = async (req, res) => {
  try {
    await recintosService.eliminarRecinto(req.params.id);
    res.json({ mensaje: 'Recinto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRecintos,
  getRecintoPorId,
  crearRecinto,
  actualizarRecinto,
  eliminarRecinto
};