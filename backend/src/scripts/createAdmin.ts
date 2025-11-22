/**
 * Script to create the first admin user
 * Run with: npx tsx src/scripts/createAdmin.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { hashPassword } from '../utils/password';
import { normalizeRUT } from '../utils/rutValidation';

dotenv.config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Get admin details from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jspdetailing.cl';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';
    const adminRUT = process.env.ADMIN_RUT || '11111111-1';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
    const adminPhone = process.env.ADMIN_PHONE || '+56 9 1234 5678';

    // Check if email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log('User with this email already exists. Updating to admin...');
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('User updated to admin:', existingUser.email);
      process.exit(0);
    }

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create admin user
    const admin = await User.create({
      email: adminEmail,
      passwordHash,
      firstName: adminFirstName,
      lastName: adminLastName,
      rut: normalizeRUT(adminRUT),
      phone: adminPhone,
      emailVerified: true, // Skip email verification for admin
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', adminPassword);
    console.log('⚠️  Please change the password after first login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

