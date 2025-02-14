const express = require('express');
const cors = require('cors');
const { authLimiter } = require('./middleware/rateLimiter');
const securityMiddleware = require('./middleware/security');
require('dotenv').config();

const app = express();

// Security middlewares
app.use(securityMiddleware);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Apply rate limiter to auth routes
app.use('/api/auth', authLimiter);

// ... rest of your server setup 