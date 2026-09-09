import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
const rawClientUrl = process.env.CLIENT_URL || '';
const allowedOrigins = rawClientUrl
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server, health checks)
      if (!origin) return callback(null, true);

      // Normalize incoming origin by removing trailing slash
      const normalizedOrigin = origin.replace(/\/+$/, '');

      // Allow local development
      if (normalizedOrigin.startsWith('http://localhost:') || normalizedOrigin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      // If no CLIENT_URL configured, allow in development
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      // Check exact match in configured allowed origins
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview and production deployments if any vercel domain is configured
      if (
        normalizedOrigin.endsWith('.vercel.app') &&
        (allowedOrigins.some((u) => u.includes('vercel.app')) || allowedOrigins.includes('*'))
      ) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true
  })
);

// Enable JSON request body parsing
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// Root fallback route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini Social Post Application API is active',
    healthCheck: '/api/health'
  });
});

// Global error handling middleware (prevents leaking stack traces in production)
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err.message || 'Internal Server Error')
  });
});

// Connect to Database and start listening
const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth routes mounted at http://localhost:${PORT}/api/auth`);
    console.log(`📝 Post routes mounted at http://localhost:${PORT}/api/posts`);
  });
};

startServer();
