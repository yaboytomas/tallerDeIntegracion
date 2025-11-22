import mongoose, { Schema, Document } from 'mongoose';

interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  orderNumber: string;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    variantId?: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  iva: number;
  shipping: number;
  total: number;
  shippingAddress: {
    region: string;
    comuna: string;
    street: string;
    number: string;
    apartment?: string;
    reference?: string;
    phone: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variantId: {
          type: Schema.Types.ObjectId,
          ref: 'ProductVariant',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    iva: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      region: { type: String, required: true },
      comuna: { type: String, required: true },
      street: { type: String, required: true },
      number: { type: String, required: true },
      apartment: String,
      reference: String,
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

