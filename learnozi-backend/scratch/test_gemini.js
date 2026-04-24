const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There is no direct "listModels" on genAI object in some versions, 
    // but we can try to check if it works for a common model.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash");
  } catch (err) {
    console.error("Error with gemini-1.5-flash:", err.message);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        await model.generateContent("test");
        console.log("Success with gemini-pro");
    } catch (err2) {
        console.error("Error with gemini-pro:", err2.message);
    }
  }
}

listModels();
