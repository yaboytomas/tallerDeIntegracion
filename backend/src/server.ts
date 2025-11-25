import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { connectDB } from './config/database';
import routes from './routes';
import { securityHeaders, apiLimiter, sanitizeInput } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - required for Render/Heroku behind reverse proxy
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB().then(async () => {
  // Update cart indexes after connection (one-time migration)
  try {
    const { CartItem } = require('./models/CartItem');
    console.log('🔄 Checking CartItem indexes...');
    await CartItem.createIndexes();
    console.log('✅ CartItem indexes verified/updated');
  } catch (error: any) {
    console.error('⚠️ Error updating CartItem indexes:', error.message);
  }
});

// Middleware
app.use(securityHeaders);
app.use(compression());
app.use(morgan('dev'));

// CORS - Allow multiple domains
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://jspdetailing.vercel.app',
  'https://jsp.zabotec.com',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// Rate limiting
app.use('/api', apiLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

