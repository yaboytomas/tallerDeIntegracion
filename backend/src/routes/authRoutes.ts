import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authLimiter, passwordResetLimiter } from '../middleware/security';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);
router.post('/logout', authController.logout);

export default router;

