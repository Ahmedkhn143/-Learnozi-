const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection & Tables...');
console.log('URL:', url);

const supabase = createClient(url, key);

async function test() {
  try {
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    if (storageError) {
      console.error('❌ Supabase Storage Error:', storageError.message);
    } else {
      console.log('✅ Supabase Storage Connected. Buckets:', buckets.map(b => b.name));
    }

    const { data: users, error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError) {
      console.error('❌ users table check failed:', usersError.message);
    } else {
      console.log('✅ users table exists and connected!');
    }

    const { data: flashcards, error: flashcardsError } = await supabase.from('flashcard_sets').select('id').limit(1);
    if (flashcardsError) {
      console.error('❌ flashcard_sets table check failed:', flashcardsError.message);
    } else {
      console.log('✅ flashcard_sets table exists and connected!');
    }

    const { data: focus, error: focusError } = await supabase.from('focus_sessions').select('id').limit(1);
    if (focusError) {
      console.error('❌ focus_sessions table check failed:', focusError.message);
    } else {
      console.log('✅ focus_sessions table exists and connected!');
    }
  } catch (err) {
    console.error('Test script crashed:', err.message);
  }
}

test();
