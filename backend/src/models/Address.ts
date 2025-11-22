import mongoose, { Schema } from 'mongoose';
import { IAddress } from '../types';

const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
    },
    comuna: {
      type: String,
      required: [true, 'Comuna is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street is required'],
      trim: true,
    },
    number: {
      type: String,
      required: [true, 'Number is required'],
      trim: true,
    },
    apartment: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
addressSchema.index({ userId: 1 });

export const Address = mongoose.model<IAddress>('Address', addressSchema);

