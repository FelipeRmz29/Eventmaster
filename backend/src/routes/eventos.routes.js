const express = require("express");
const eventosController = require("../controllers/eventos.controller");

const router = express.Router();

router.get("/", eventosController.getEventos);
router.get("/:id", eventosController.getEventoPorId);

module.exports = router;
