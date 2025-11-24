import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

// Optional authentication middleware - allows guest users
const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies?.accessToken;

  if (token) {
    // Try to authenticate, but don't fail if token is invalid
    const { verifyAccessToken } = require('../middleware/auth');
    const decoded = verifyAccessToken(token);
    if (decoded) {
      (req as AuthRequest).user = decoded;
    }
  }
  next();
};

const router = Router();

// Cart routes with optional authentication (guest or authenticated)
router.get('/', optionalAuth, cartController.getCart);
router.post('/', optionalAuth, cartController.addToCart);
router.put('/:id', optionalAuth, cartController.updateCartItem);
router.delete('/:id', optionalAuth, cartController.removeFromCart);

// Quotation request (no auth required - can be used by guests)
router.post('/request-quote', optionalAuth, cartController.requestQuotation);

export default router;

