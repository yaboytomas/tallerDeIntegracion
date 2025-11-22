import mongoose, { Schema, Document } from 'mongoose';

interface IEmailVerification extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // TTL index - auto-delete expired documents
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
emailVerificationSchema.index({ token: 1 });
emailVerificationSchema.index({ userId: 1 });

export const EmailVerification = mongoose.model<IEmailVerification>('EmailVerification', emailVerificationSchema);

