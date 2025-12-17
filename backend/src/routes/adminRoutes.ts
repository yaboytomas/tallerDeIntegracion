import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as adminUserController from '../controllers/adminUserController';
import * as orderController from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { uploadProduct, uploadCategory, uploadBanner } from '../services/cloudinaryUpload';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminUserController.getAllUsers);
router.post('/users/create-admin', adminUserController.createAdminUser);
router.put('/users/:id/role', adminUserController.updateUserRole);
router.delete('/users/:id', adminUserController.deleteUser);

// Products
router.get('/products', adminController.getAdminProducts);
router.post('/products', uploadProduct.array('images', 10), adminController.createProduct);
router.put('/products/:id', uploadProduct.array('images', 10), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Categories
router.get('/categories', adminController.getAdminCategories);
router.post('/categories', uploadCategory.single('image'), adminController.createCategory);
router.put('/categories/:id', uploadCategory.single('image'), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Banners
router.get('/banners', adminController.getBanners);
router.post('/banners', uploadBanner.single('image'), adminController.createBanner);
router.put('/banners/:id', uploadBanner.single('image'), adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

// Content Pages
router.get('/content', adminController.getContentPages);
router.get('/content/:slug', adminController.getContentPage);
router.post('/content', adminController.createOrUpdateContentPage);
router.put('/content/:slug', adminController.createOrUpdateContentPage);

// Orders
router.get('/orders/:id', orderController.getOrderByIdAdmin);
router.put('/orders/:id/status', orderController.updateOrderStatus);

export default router;

