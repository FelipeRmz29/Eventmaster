const express = require("express");
const ticketsController = require("../controllers/tickets.controller");

const router = express.Router();

router.post("/confirmar", ticketsController.confirmarCompra);
router.post("/compra", ticketsController.comprarTicket);
router.post("/qr", ticketsController.generarQR);
router.get("/:id", ticketsController.getTicketById);

module.exports = router;
