const express = require("express");
const ticketsController = require("../controllers/tickets.controller");
const router = express.Router();

router.get("/:id", ticketsController.getTicketById);
router.post("/confirmar", ticketsController.confirmarCompra);
router.post("/compra", ticketsController.comprarTicket);
router.post("/qr", ticketsController.generarQR);
router.post("/validar", ticketsController.validarQR);

module.exports = router;