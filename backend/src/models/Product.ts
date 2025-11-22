import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: String,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    offerPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: 0,
      default: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search index

export const Product = mongoose.model<IProduct>('Product', productSchema);

