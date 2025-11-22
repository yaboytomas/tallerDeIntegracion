import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Rate limiting for general API routes
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiting for auth routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Demasiados intentos de autenticación, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiting for password reset
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Demasiadas solicitudes de recuperación de contraseña, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Sanitize input - basic XSS prevention
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  // Recursively sanitize object
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize body in place (body is writable)
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitize(req.body[key]);
    });
  }

  // Sanitize query in place (query is read-only, so we modify its properties)
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      const sanitized = sanitize(req.query[key]);
      // Use Object.defineProperty to safely update
      Object.defineProperty(req.query, key, {
        value: sanitized,
        writable: true,
        enumerable: true,
        configurable: true
      });
    });
  }

  // Sanitize params in place (params is read-only, so we modify its properties)
  if (req.params && typeof req.params === 'object') {
    Object.keys(req.params).forEach(key => {
      const sanitized = sanitize(req.params[key]);
      // Use Object.defineProperty to safely update
      Object.defineProperty(req.params, key, {
        value: sanitized,
        writable: true,
        enumerable: true,
        configurable: true
      });
    });
  }

  next();
}

