import { Router } from 'express';
import * as productController from '../controllers/productController';

const router = Router();

router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProduct);

export default router;

