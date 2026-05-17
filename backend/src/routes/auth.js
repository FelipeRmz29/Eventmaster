const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const supabase = require('../services/supabase');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  // Buscar admin en Supabase
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !admin) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  // Verificar contraseña
  const passwordMatch = await bcrypt.compare(password, admin.password_hash);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  // Generar token
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET no estÃ¡ configurado' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(200).json({ token });
});

module.exports = router;
