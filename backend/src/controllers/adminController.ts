import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { Category } from '../models/Category';
import { HomeBanner } from '../models/HomeBanner';
import { ContentPage } from '../models/ContentPage';
import { Order } from '../models/Order';
import { AuthRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { generateUniqueSlug } from '../utils/slug';
import { generateSKU } from '../utils/sku';
import { deleteCloudinaryImage } from '../services/cloudinaryUpload';
import { createAuditLog } from '../middleware/auditLog';

// Dashboard stats
export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const [totalProducts, lowStockProducts, ordersToday, recentOrders] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lt: 10 }, status: 'active' }),
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'firstName lastName email')
        .lean(),
    ]);

    res.json({
      totalProducts,
      lowStockProducts,
      ordersToday,
      recentOrders,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

// Product Management
export async function getAdminProducts(req: Request, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20', search, status } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { sku: new RegExp(search as string, 'i') },
      ];
    }
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      name,
      description,
      categoryId,
      brand,
      basePrice,
      offerPrice,
      stock,
      weight,
      dimensions,
      status = 'active',
      featured = false,
      sku,
      variants,
    } = req.body;

    if (!name || !description || !categoryId || !basePrice) {
      throw new CustomError('Nombre, descripción, categoría y precio son requeridos', 400);
    }

    // Generate SKU if not provided
    const productSKU = sku || generateSKU();

    // Check SKU uniqueness
    const existingSKU = await Product.findOne({ sku: productSKU });
    if (existingSKU) {
      throw new CustomError('SKU ya existe', 409);
    }

    // Generate slug
    const slug = await generateUniqueSlug(name, async (s) => {
      const exists = await Product.findOne({ slug: s });
      return !exists;
    });

    // Handle image uploads (Cloudinary provides full URL in file.path)
    const images = req.files
      ? (req.files as Express.Multer.File[]).map((file) => file.path)
      : [];

    const product = await Product.create({
      sku: productSKU,
      name,
      slug,
      description,
      categoryId,
      brand,
      basePrice: parseFloat(basePrice),
      offerPrice: offerPrice ? parseFloat(offerPrice) : undefined,
      stock: parseInt(stock || '0', 10),
      weight: weight ? parseFloat(weight) : undefined,
      dimensions: dimensions || undefined,
      images,
      status,
      featured,
    });

    // Create variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await ProductVariant.create({
          productId: product._id,
          name: variant.name,
          value: variant.value,
          sku: variant.sku || generateSKU(),
          priceModifier: variant.priceModifier || 0,
          stock: variant.stock || 0,
        });
      }
    }

    // Audit log
    await createAuditLog(req.user?.userId, 'CREATE', 'Product', product._id.toString(), req.body, req);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new CustomError('Producto no encontrado', 404);
    }

    // Handle new images (Cloudinary provides full URL in file.path)
    if (req.files && Array.isArray(req.files)) {
      const newImages = (req.files as Express.Multer.File[]).map((file) => file.path);
      updateData.images = [...(product.images || []), ...newImages];
    }

    // Update slug if name changed
    if (updateData.name && updateData.name !== product.name) {
      updateData.slug = await generateUniqueSlug(updateData.name, async (s) => {
        const exists = await Product.findOne({ slug: s, _id: { $ne: id } });
        return !exists;
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Audit log
    await createAuditLog(req.user?.userId, 'UPDATE', 'Product', id, updateData, req);

    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  }
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      throw new CustomError('Producto no encontrado', 404);
    }

    if (hardDelete === 'true') {
      // Delete images from Cloudinary
      if (product.images && product.images.length > 0) {
        await Promise.all(product.images.map((image) => deleteCloudinaryImage(image)));
      }

      // Delete variants
      await ProductVariant.deleteMany({ productId: id });

      // Delete product
      await Product.findByIdAndDelete(id);
    } else {
      // Soft delete
      await Product.findByIdAndUpdate(id, { status: 'inactive' });
    }

    // Audit log
    await createAuditLog(req.user?.userId, 'DELETE', 'Product', id, { hardDelete }, req);

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
}

// Category Management
export async function getAdminCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
}

export async function createCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, parentId, order = 0, status = 'active' } = req.body;

    if (!name) {
      throw new CustomError('Nombre de categoría requerido', 400);
    }

    const slug = await generateUniqueSlug(name, async (s) => {
      const exists = await Category.findOne({ slug: s });
      return !exists;
    });

    const image = req.file ? req.file.path : undefined;

    const category = await Category.create({
      name,
      slug,
      description,
      parentId: parentId || null,
      order: parseInt(order, 10),
      status,
      image,
    });

    await createAuditLog(req.user?.userId, 'CREATE', 'Category', category._id.toString(), req.body, req);

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }
}

export async function updateCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.name) {
      updateData.slug = await generateUniqueSlug(updateData.name, async (s) => {
        const exists = await Category.findOne({ slug: s, _id: { $ne: id } });
        return !exists;
      });
    }

    if (req.file) {
      updateData.image = req.file.path;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new CustomError('Categoría no encontrada', 404);
    }

    await createAuditLog(req.user?.userId, 'UPDATE', 'Category', id, updateData, req);

    res.json({
      message: 'Categoría actualizada exitosamente',
      category,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar categoría' });
    }
  }
}

export async function deleteCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await Product.countDocuments({ categoryId: id });
    if (productCount > 0) {
      throw new CustomError('No se puede eliminar categoría con productos asociados', 400);
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentId: id });
    if (subcategoryCount > 0) {
      throw new CustomError('No se puede eliminar categoría con subcategorías', 400);
    }

    await Category.findByIdAndDelete(id);

    await createAuditLog(req.user?.userId, 'DELETE', 'Category', id, {}, req);

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar categoría' });
    }
  }
}

// Banner Management
export async function getBanners(_req: Request, res: Response): Promise<void> {
  try {
    const banners = await HomeBanner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener banners' });
  }
}

export async function createBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, subtitle, ctaText, ctaLink, active = true, order = 0 } = req.body;

    if (!title || !req.file) {
      throw new CustomError('Título e imagen son requeridos', 400);
    }

    const banner = await HomeBanner.create({
      title,
      subtitle,
      ctaText,
      ctaLink,
      image: req.file.path,
      active,
      order: parseInt(order, 10),
    });

    await createAuditLog(req.user?.userId, 'CREATE', 'HomeBanner', banner._id.toString(), req.body, req);

    res.status(201).json({
      message: 'Banner creado exitosamente',
      banner,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al crear banner' });
    }
  }
}

export async function updateBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) {
      updateData.image = req.file.path;
    }

    const banner = await HomeBanner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      throw new CustomError('Banner no encontrado', 404);
    }

    await createAuditLog(req.user?.userId, 'UPDATE', 'HomeBanner', id, updateData, req);

    res.json({
      message: 'Banner actualizado exitosamente',
      banner,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar banner' });
    }
  }
}

export async function deleteBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const banner = await HomeBanner.findById(id);
    if (banner && banner.image) {
      await deleteCloudinaryImage(banner.image);
    }

    await HomeBanner.findByIdAndDelete(id);

    await createAuditLog(req.user?.userId, 'DELETE', 'HomeBanner', id, {}, req);

    res.json({ message: 'Banner eliminado exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar banner' });
    }
  }
}

// Content Page Management
export async function getContentPages(_req: Request, res: Response): Promise<void> {
  try {
    const pages = await ContentPage.find().sort({ slug: 1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener páginas de contenido' });
  }
}

export async function getContentPage(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const page = await ContentPage.findOne({ slug });

    if (!page) {
      throw new CustomError('Página no encontrada', 404);
    }

    res.json(page);
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener página' });
    }
  }
}

export async function createOrUpdateContentPage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { slug, title, content, metaDescription } = req.body;

    if (!slug || !title || !content) {
      throw new CustomError('Slug, título y contenido son requeridos', 400);
    }

    const page = await ContentPage.findOneAndUpdate(
      { slug },
      { title, content, metaDescription },
      { upsert: true, new: true, runValidators: true }
    );

    await createAuditLog(req.user?.userId, 'UPSERT', 'ContentPage', page._id.toString(), req.body, req);

    res.json({
      message: 'Página de contenido guardada exitosamente',
      page,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al guardar página' });
    }
  }
}

