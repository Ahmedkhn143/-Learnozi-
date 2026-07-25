const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'Password123!';
const testName = 'Test User';

async function runLocalTest() {
  console.log("=== STARTING LOCAL API INTEGRATION TEST FOR LEARNOZI ===");
  console.log("Target URL:", BASE_URL);
  
  // 1. Sign Up
  console.log(`\n1. Attempting sign up with: ${testEmail}...`);
  let signupRes;
  try {
    signupRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: testName,
      email: testEmail,
      password: testPassword
    });
    console.log("Signup success! Status:", signupRes.status);
    console.log("User response:", signupRes.data.user);
  } catch (err) {
    console.error("Signup failed:", err.response ? err.response.data : err.message);
    return;
  }

  // 2. Login
  console.log(`\n2. Attempting login...`);
  let loginToken;
  try {
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    console.log("Login success! Status:", loginRes.status);
    loginToken = loginRes.data.token;
    console.log("Token retrieved successfully.");
  } catch (err) {
    console.error("Login failed:", err.response ? err.response.data : err.message);
    return;
  }

  const headers = { Authorization: `Bearer ${loginToken}` };

  // 3. Get Initial Focus Stats
  console.log(`\n3. Fetching initial focus stats...`);
  try {
    const focusRes = await axios.get(`${BASE_URL}/api/focus`, { headers });
    console.log("Initial stats:", focusRes.data);
  } catch (err) {
    console.error("Failed to get initial focus stats:", err.response ? err.response.data : err.message);
  }

  // 4. Log a New Focus Session
  console.log(`\n4. Logging a new 25-minute focus session for 'Physics'...`);
  try {
    const postRes = await axios.post(`${BASE_URL}/api/focus`, {
      subject: 'Physics',
      durationMin: 25,
      completed: true
    }, { headers });
    console.log("Log session response status:", postRes.status);
    console.log("Created session:", postRes.data.session);
  } catch (err) {
    console.error("Failed to log focus session:", err.response ? err.response.data : err.message);
    return;
  }

  // 5. Get Updated Focus Stats
  console.log(`\n5. Fetching updated focus stats to verify dashboard/storage...`);
  try {
    const focusRes2 = await axios.get(`${BASE_URL}/api/focus`, { headers });
    console.log("Updated stats:", focusRes2.data);
    
    const { todayMinutes, weekMinutes, totalSessions, sessions } = focusRes2.data;
    if (todayMinutes === 25 && weekMinutes === 25 && totalSessions === 1 && sessions.length === 1 && sessions[0].subject === 'Physics') {
      console.log("\n✅ SUCCESS: Data is stored and retrieved perfectly on the local server!");
    } else {
      console.error("\n❌ FAILURE: Stats do not match expected values:", focusRes2.data);
    }
  } catch (err) {
    console.error("Failed to get updated focus stats:", err.response ? err.response.data : err.message);
  }
}

runLocalTest().catch(console.error);
