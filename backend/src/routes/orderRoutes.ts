import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/cancel', orderController.cancelOrder);

export default router;
