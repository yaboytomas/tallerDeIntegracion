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
import { runContentPagesSeeder } from './scripts/seedContentPages';

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
    console.log('🔄 Migrating CartItem indexes...');
    
    // Get existing indexes
    const existingIndexes = await CartItem.collection.getIndexes();
    console.log('📋 Current indexes:', Object.keys(existingIndexes));
    
    // Drop all indexes except _id
    try {
      await CartItem.collection.dropIndexes();
      console.log('✅ Dropped old indexes');
    } catch (dropError: any) {
      if (dropError.codeName !== 'NamespaceNotFound') {
        console.log('⚠️ Could not drop indexes:', dropError.message);
      }
    }
    
    // Create new indexes with proper partial filters
    await CartItem.createIndexes();
    
    // Verify new indexes
    const newIndexes = await CartItem.collection.getIndexes();
    console.log('📋 New indexes created:', Object.keys(newIndexes));
    console.log('✅ CartItem indexes migration complete!');
  } catch (error: any) {
    console.error('❌ Error migrating CartItem indexes:', error.message);
    console.error('Stack:', error.stack);
  }
  
  // Seed content pages if they don't exist
  try {
    await runContentPagesSeeder();
  } catch (error: any) {
    console.error('❌ Error seeding content pages:', error.message);
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

// Handle OPTIONS preflight requests - must be before CORS middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    
    // Always respond to OPTIONS, but only set CORS headers if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id, X-Session-Id');
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
    }
    res.sendStatus(204);
  } else {
    next();
  }
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Log origin for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('CORS check - Origin:', origin);
      console.log('CORS check - Allowed origins:', allowedOrigins);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('CORS blocked origin:', origin);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'X-Session-Id'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
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

