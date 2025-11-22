import mongoose, { Schema, Document } from 'mongoose';

interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
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
      expires: 0, // TTL index - auto-delete expired documents (15 minutes)
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ userId: 1 });

export const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', passwordResetSchema);

