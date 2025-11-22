import crypto from 'crypto';

/**
 * Generate random token for email verification and password reset
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate expiration date (default 15 minutes for password reset)
 */
export function generateExpirationDate(minutes: number = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

