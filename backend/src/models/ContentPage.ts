import mongoose, { Schema } from 'mongoose';
import { IContentPage } from '../types';

const contentPageSchema = new Schema<IContentPage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    metaDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Indexes
contentPageSchema.index({ slug: 1 });

export const ContentPage = mongoose.model<IContentPage>('ContentPage', contentPageSchema);

