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
const clientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    origin: clientUrl
      ? (origin, callback) => {
          if (!origin || origin === clientUrl || origin.startsWith('http://localhost:')) {
            callback(null, true);
          } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
          }
        }
      : true,
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

// Connect to Database and start listening
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth routes mounted at http://localhost:${PORT}/api/auth`);
    console.log(`📝 Post routes mounted at http://localhost:${PORT}/api/posts`);
  });
};

startServer();
