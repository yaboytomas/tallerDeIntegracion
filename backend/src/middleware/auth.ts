import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload } from '../types';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  const expiresIn = process.env.JWT_EXPIRE || '15m';
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d';
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Verify user still exists
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Authorization middleware - checks if user is admin
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

