require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./src/services/supabase');

const app = express();

// Prueba de conexión
supabase
  .from('USERS_TEST')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) console.error('Error de conexión:', error.message);
    else console.log('Supabase conectado ✓');
  });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'EventMaster API running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));