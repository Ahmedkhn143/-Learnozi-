// Standalone test — no imports from app code
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ok',
    message: 'Vercel Node.js is working!',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET ✓' : 'NOT SET ✗',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET ✓' : 'NOT SET ✗',
      CLIENT_URL: process.env.CLIENT_URL || 'NOT SET',
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET ✓' : 'NOT SET ✗',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET ✓' : 'NOT SET ✗',
    }
  }));
};
