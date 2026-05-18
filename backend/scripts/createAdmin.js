// Uso: node scripts/createAdmin.js <email> <contraseña>
// Ejemplo: node scripts/createAdmin.js "admin@eventmaster.com" "admin123"
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const supabase = require('../src/services/supabase');

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Uso: node scripts/createAdmin.js <email> <contraseña>');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('admins')
    .insert({ email, password_hash })
    .select('email')
    .single();

  if (error) {
    console.error('Error al crear admin:', error.message);
    process.exit(1);
  }

  console.log('Admin creado exitosamente:', data);
}

main();
