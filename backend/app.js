require("dotenv").config();
const express = require("express");
const cors = require("cors");

const asientosRoutes = require("./src/routes/asientos.routes");
const eventosRoutes = require("./src/routes/eventos.routes");
const ticketsRoutes = require("./src/routes/tickets.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "EventMaster API running" }));
app.use("/eventos", eventosRoutes);
app.use("/asientos", asientosRoutes);
app.use("/tickets", ticketsRoutes);

module.exports = app;
