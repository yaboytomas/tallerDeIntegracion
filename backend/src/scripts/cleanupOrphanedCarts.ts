import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CartItem } from '../models/CartItem';

// Load environment variables
dotenv.config();

async function cleanupOrphanedCarts() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Delete orphaned cart items (no userId and no valid sessionId)
    console.log('🧹 Cleaning up orphaned cart items...');
    
    const result = await CartItem.deleteMany({
      userId: null,
      $or: [
        { sessionId: null },
        { sessionId: '' },
        { sessionId: { $exists: false } },
      ],
    });

    console.log(`✅ Deleted ${result.deletedCount} orphaned cart items`);

    // Show remaining cart items count
    const remainingCount = await CartItem.countDocuments();
    console.log(`📊 Remaining cart items: ${remainingCount}`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupOrphanedCarts();

