const { createClient } = require('@supabase/supabase-js');

let supabase = null;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: Missing Supabase environment variables. Supabase features will be unavailable.');
} else {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('✨ Supabase client initialized successfully.');
}

module.exports = supabase;
