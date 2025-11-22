import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import cartRoutes from './cartRoutes';
import userRoutes from './userRoutes';
import orderRoutes from './orderRoutes';
import adminRoutes from './adminRoutes';
import { HomeBanner } from '../models/HomeBanner';
import { ContentPage } from '../models/ContentPage';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

// Get active home banners
router.get('/home/banners', async (_req, res) => {
  try {
    const banners = await HomeBanner.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener banners' });
  }
});

// Get content page by slug
router.get('/content/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await ContentPage.findOne({ slug }).lean();
    
    if (!page) {
      res.status(404).json({ error: 'Página no encontrada' });
      return;
    }
    
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener página' });
  }
});

// Protected routes
router.use('/cart', cartRoutes);
router.use('/user', userRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;

