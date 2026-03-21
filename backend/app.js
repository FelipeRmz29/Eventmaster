require("dotenv").config();
const express = require("express");
const cors = require("cors");

const asientosRoutes = require("./src/routes/asientos.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "EventMaster API running" }));
app.use("/asientos", asientosRoutes);

module.exports = app;