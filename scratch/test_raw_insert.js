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

async function testInsert() {
  // Let's get the user we registered earlier
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!users || users.length === 0) {
    console.log("No users found in public.users. Please run the register test first.");
    return;
  }
  const userId = users[0].id;
  console.log(`Using existing user ID from public.users: ${userId}`);

  // Try to insert focus session
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({
      user_id: userId,
      subject: 'Test Physics',
      duration_min: 25,
      completed: true
    });

  if (error) {
    console.error("Insert failed with error:");
    console.error(error);
  } else {
    console.log("Insert succeeded!", data);
  }
}

testInsert().catch(console.error);
