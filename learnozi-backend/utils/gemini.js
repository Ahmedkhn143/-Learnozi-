const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// List of models to try in order of preference
const MODELS = [
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-1.5-flash',
  'gemini-pro-latest'
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates content with automatic model failover and retry logic for quota errors.
 * @param {Object} options - { prompt, systemInstruction, generationConfig, history }
 * @param {number} attempt - Internal attempt counter
 */
exports.generateWithFailover = async ({ prompt, systemInstruction, generationConfig, history }, attempt = 1) => {
  if (!config.gemini.apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`[AI] Attempting ${modelName} (Attempt ${attempt})...`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const requestOptions = {
        generationConfig: generationConfig || { temperature: 0.7, maxOutputTokens: 2000 },
      };

      // Add system instruction if supported by the model version
      // Note: older SDKs/models handle systemInstruction differently, 
      // but current gemini-1.5+ handles it in getGenerativeModel or generateContent
      const modelWithSystem = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction 
      });

      let result;
      if (history) {
        const chat = modelWithSystem.startChat({ history });
        result = await chat.sendMessage(prompt);
      } else {
        result = await modelWithSystem.generateContent(prompt);
      }

      return result;
    } catch (error) {
      lastError = error;
      const status = error.status || (error.response && error.response.status);
      const isQuotaError = status === 429 || error.message.includes('429') || error.message.includes('Quota exceeded');

      console.warn(`[AI] ${modelName} failed: ${error.message}`);

      if (isQuotaError && attempt < 2) {
        console.log(`[AI] Quota hit. Waiting 5s before retry...`);
        await sleep(5000);
        return exports.generateWithFailover({ prompt, systemInstruction, generationConfig, history }, attempt + 1);
      }

      // If it's a 404 (model not found), just continue to next model in list
      if (status === 404 || error.message.includes('404')) {
        continue;
      }
      
      // For other errors, try next model as well
      continue;
    }
  }

  throw lastError || new Error('All AI models failed to respond.');
};
