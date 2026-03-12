const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, //URL de Supabase
  process.env.SUPABASE_SERVICE_KEY // Service key para operaciones de backend
);

module.exports = supabase;