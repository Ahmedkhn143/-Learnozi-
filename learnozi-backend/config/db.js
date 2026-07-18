const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;

const connectDB = async () => {
  // Reuse existing connection (important for serverless/Vercel)
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('MongoDB: reusing existing connection.');
    return;
  }

  const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: isVercel ? 10000 : 3000,
    });
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️  Could not connect to MongoDB at "${config.mongoUri}": ${error.message}`);

    if (isVercel) {
      // On Vercel/production, mongodb-memory-server won't work — throw the error
      console.error('❌ MongoDB connection failed in production. Please set a valid MONGODB_URI.');
      throw error;
    }

    // Local dev only: fallback to in-memory MongoDB
    console.log(`🚀 Starting in-memory MongoDB server for local development...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      isConnected = true;
      console.log(`✨ In-memory MongoDB connected successfully!`);
      console.log(`ℹ️  Note: Data will be cleared when the backend restarts.\n`);
    } catch (memError) {
      console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

