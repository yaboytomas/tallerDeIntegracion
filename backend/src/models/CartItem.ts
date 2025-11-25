import mongoose, { Schema } from 'mongoose';
import { ICartItem } from '../types';

const cartItemSchema = new Schema<ICartItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes - ensure user or session is present
cartItemSchema.index({ userId: 1 });
cartItemSchema.index({ sessionId: 1 });

// Compound unique index for logged-in users (userId must exist, variantId can be null)
cartItemSchema.index(
  { userId: 1, productId: 1, variantId: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { userId: { $type: 'objectId' } }
  }
);

// Compound unique index for guest users (sessionId must exist, variantId can be null)
cartItemSchema.index(
  { sessionId: 1, productId: 1, variantId: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { 
      sessionId: { $type: 'string', $nin: [null, ''] }
    }
  }
);

export const CartItem = mongoose.model<ICartItem>('CartItem', cartItemSchema);

