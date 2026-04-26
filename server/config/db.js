const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Keep a cached connection in development to avoid hot-reload reconnects
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options keep the connection pool healthy
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message);
    // Let the process exit — we can't run without a DB
    process.exit(1);
  }
};

module.exports = connectDB;
