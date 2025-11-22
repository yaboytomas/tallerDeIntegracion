import mongoose, { Schema } from 'mongoose';
import { IProductVariant } from '../types';

const productVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Variant name is required (e.g., size, color)'],
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Variant value is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    priceModifier: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
productVariantSchema.index({ productId: 1 });
productVariantSchema.index({ sku: 1 });

export const ProductVariant = mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);

