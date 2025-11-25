import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CartItem } from '../models/CartItem';

// Load environment variables
dotenv.config();

/**
 * Script to update CartItem indexes
 * This removes old indexes and creates new ones with proper partial filter expressions
 */
async function updateCartIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taller-integracion';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get existing indexes
    console.log('\n📋 Current indexes:');
    const existingIndexes = await CartItem.collection.getIndexes();
    console.log(JSON.stringify(existingIndexes, null, 2));

    // Drop all indexes except _id
    console.log('\n🗑️ Dropping old indexes...');
    try {
      await CartItem.collection.dropIndexes();
      console.log('✅ Old indexes dropped');
    } catch (error: any) {
      if (error.codeName === 'NamespaceNotFound') {
        console.log('⚠️ Collection not found, will be created on first insert');
      } else {
        console.error('Error dropping indexes:', error.message);
      }
    }

    // Recreate indexes from the model
    console.log('\n📝 Creating new indexes...');
    await CartItem.createIndexes();
    console.log('✅ New indexes created');

    // Show new indexes
    console.log('\n📋 New indexes:');
    const newIndexes = await CartItem.collection.getIndexes();
    console.log(JSON.stringify(newIndexes, null, 2));

    console.log('\n✅ Index update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating indexes:', error);
    process.exit(1);
  }
}

// Run the script
updateCartIndexes();

