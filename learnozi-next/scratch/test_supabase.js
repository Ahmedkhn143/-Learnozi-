const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', url);

const supabase = createClient(url, key);

async function test() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Supabase Storage Error:', error.message);
    } else {
      console.log('✅ Supabase Connection Successful!');
      console.log('Buckets found:', buckets.map(b => b.name));
    }
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

test();
