const mongoose = require('mongoose');
const config = require('./index');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // If mongoUri is localhost and we know it's not running, we can skip and go to memory server
    // or just let it try and catch the error. Let's try connecting first:
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000, // fail quickly to switch to in-memory db
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️  Could not connect to MongoDB at "${config.mongoUri}": ${error.message}`);
    console.log(`🚀 Starting in-memory MongoDB server for local development...`);
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✨ In-memory MongoDB connected successfully!`);
      console.log(`ℹ️  Note: Data will be cleared when the backend restarts.\n`);
    } catch (memError) {
      console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

