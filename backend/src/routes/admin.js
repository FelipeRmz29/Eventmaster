const express = require('express');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken);

router.get('/dashboard', (req, res) => {
  res.json({ mensaje: `Bienvenido, ${req.admin.email}` });
});

module.exports = router;