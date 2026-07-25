const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    if (match[1] && value) {
      env[match[1]] = value;
    }
  }
});

console.log("Adding environment variables to Vercel...");

const targets = 'production,preview,development';

for (const [key, value] of Object.entries(env)) {
  console.log(`Setting ${key}...`);
  try {
    // Add or force overwrite the environment variable using stdio: 'ignore'
    execSync(`npx vercel env add ${key} ${targets} --value "${value}" --no-sensitive --yes --force`, { stdio: 'ignore' });
    console.log(`✅ Successfully set ${key}`);
  } catch (err) {
    console.error(`❌ Failed to set ${key}:`, err.message);
  }
}

console.log("\nAll environment variables added! Redeploying is required for them to take effect.");
