require('dotenv').config();
const axios = require('axios');

async function testFetch() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await axios.get(url);
        console.log("Status:", response.status);
        console.log("Models listed:", response.data.models ? response.data.models.map(m => m.name) : "No models found");
    } catch (err) {
        console.error("Fetch error:", err.response ? err.response.data : err.message);
    }
}

testFetch();
