const express = require('express');
const router = express.Router();
const recintosController = require('../controllers/recintos.controller');

router.get('/', recintosController.getRecintos);
router.get('/:id', recintosController.getRecintoPorId);
router.post('/', recintosController.crearRecinto);
router.put('/:id', recintosController.actualizarRecinto);
router.delete('/:id', recintosController.eliminarRecinto);

module.exports = router;