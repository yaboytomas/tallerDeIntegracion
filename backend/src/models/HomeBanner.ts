import mongoose, { Schema } from 'mongoose';
import { IHomeBanner } from '../types';

const homeBannerSchema = new Schema<IHomeBanner>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    ctaText: {
      type: String,
      trim: true,
    },
    ctaLink: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
homeBannerSchema.index({ active: 1, order: 1 });

export const HomeBanner = mongoose.model<IHomeBanner>('HomeBanner', homeBannerSchema);

