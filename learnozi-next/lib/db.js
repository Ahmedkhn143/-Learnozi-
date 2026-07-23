import mongoose from 'mongoose';

if (process.env.MOCK_DB === 'true') {
  require('./mongooseMock');
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnozi';

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    global.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✨ MongoDB Connected via Next.js lib/db');
      return mongooseInstance;
    }).catch(err => {
      console.warn('⚠️ MongoDB Connection warning:', err.message);
      global.mongoose.promise = null;
      throw err;
    });
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    global.mongoose.promise = null;
    throw e;
  }

  return global.mongoose.conn;
}
