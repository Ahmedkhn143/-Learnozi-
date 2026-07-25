const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log("Inspecting database constraints for focus_sessions...");
  
  // We can execute SQL queries by calling Supabase's internal RPC or checking foreign keys via API if we can,
  // or we can query information about constraints.
  // In Supabase, we can query information_schema if we have access via RPC or if we can run a query.
  // Let's see if we can get list of tables or see details.
  
  // Let's try running a direct query via Supabase function if available, or just fetch table structure.
  // Since we cannot run raw SQL directly unless we use an RPC function, let's see if we can check if there's any RPC function.
  // If not, we can query focus_sessions definition or try to insert a record with a null or invalid user_id to see the exact error message.
  
  // Let's inspect focus_sessions columns
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .limit(1);
    
  console.log("Columns response:", { data, error });
}

inspectSchema().catch(console.error);
