const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // Try explicitly requesting v1
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash (v1)");
  } catch (err) {
    console.error("Error with gemini-1.5-flash (v1):", err.message);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        await model.generateContent("test");
        console.log("Success with gemini-1.5-flash-latest");
    } catch (err2) {
        console.error("Error with gemini-1.5-flash-latest:", err2.message);
    }
  }
}

listModels();
