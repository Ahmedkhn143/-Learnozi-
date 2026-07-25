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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  
  // 1. Check Focus Sessions
  console.log("\n--- Checking focus_sessions ---");
  const { data: focusSessions, error: focusError } = await supabase
    .from('focus_sessions')
    .select('*')
    .limit(10);
  
  if (focusError) {
    console.error("Error fetching focus_sessions:", focusError);
  } else {
    console.log(`Found ${focusSessions.length} focus sessions:`);
    console.log(JSON.stringify(focusSessions, null, 2));
  }

  // 2. Check Flashcards
  console.log("\n--- Checking flashcards ---");
  const { data: flashcards, error: flashcardsError } = await supabase
    .from('flashcards')
    .select('*')
    .limit(10);
  
  if (flashcardsError) {
    console.error("Error fetching flashcards:", flashcardsError);
  } else {
    console.log(`Found ${flashcards.length} flashcards:`);
    console.log(JSON.stringify(flashcards, null, 2));
  }
  
  // 3. Check Users
  console.log("\n--- Checking users ---");
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .limit(5);
  
  if (usersError) {
    console.error("Error fetching users:", usersError);
  } else {
    console.log(`Found ${users.length} users:`);
    console.log(JSON.stringify(users, null, 2));
  }
}

checkData().catch(console.error);
