/**
 * PREPFORGE BACKEND ENGINE
 * This is the main entry point for our API server.
 */
const dotenv = require("dotenv");
dotenv.config(); // Load our environment secrets first thing!

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/index.js");
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- CORS CONFIG ---
// We need to allow our Vercel frontend to talk to this server.
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL, 
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // If the origin is in our list, or it's a local request (no origin), we're good
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`[CORS] Blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true
}));

app.use(express.json()); // Allow us to read JSON in request bodies

// --- DATABASE CONNECTION ---
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database connection successful! ✅"))
  .catch(err => {
    console.error("Database connection failed! ❌");
    console.error(err.message);
  });

// --- API ROUTES ---
app.use("/api", routes);

// Global Error Handler - catches any errors thrown in our routes
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 Server is humming along on port ${PORT}`);
  console.log(`-----------------------------------------`);
});
