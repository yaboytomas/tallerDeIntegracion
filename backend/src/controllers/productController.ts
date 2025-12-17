import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { Category } from '../models/Category';
import { CustomError } from '../middleware/errorHandler';
import { calculatePriceWithIVA } from '../utils/currency';

/**
 * Get all products with filters, sorting, and pagination
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      brand,
      inStock,
      featured,
      search,
      sort = 'newest',
      page = '1',
      limit = '20',
    } = req.query;

    // Build query
    const query: any = { status: 'active' };

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      }
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (brand) {
      query.brand = new RegExp(brand as string, 'i');
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i'); // Case-insensitive partial match
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
      ];
    }

    // Build sort
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'price-low':
        sortOption = { basePrice: 1 };
        break;
      case 'price-high':
        sortOption = { basePrice: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { featured: -1, createdAt: -1 };
        break;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Format products with IVA
    const formattedProducts = products.map((product: any) => ({
      ...product,
      priceWithIVA: calculatePriceWithIVA(product.basePrice),
      offerPriceWithIVA: product.offerPrice
        ? calculatePriceWithIVA(product.offerPrice)
        : null,
    }));

    res.json({
      products: formattedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}

/**
 * Get single product by ID or slug
 */
export async function getProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Try to find by ID first, then by slug
    let product;
    
    // Check if id is a valid MongoDB ObjectId (24 hex characters)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('categoryId', 'name slug').lean();
    }
    
    // If not found by ID, try by slug
    if (!product) {
      product = await Product.findOne({ slug: id }).populate('categoryId', 'name slug').lean();
    }

    if (!product) {
      throw new CustomError('Producto no encontrado', 404);
    }

    // Get variants
    const variants = await ProductVariant.find({ productId: product._id }).lean();

    // Get related products (same category)
    const relatedProducts = await Product.find({
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      status: 'active',
    })
      .limit(4)
      .select('name slug images basePrice offerPrice')
      .lean();

    const formattedProduct: any = {
      ...product,
      priceWithIVA: calculatePriceWithIVA(product.basePrice),
      offerPriceWithIVA: product.offerPrice
        ? calculatePriceWithIVA(product.offerPrice)
        : null,
      variants,
      relatedProducts: relatedProducts.map((p: any) => ({
        ...p,
        priceWithIVA: calculatePriceWithIVA(p.basePrice),
        offerPriceWithIVA: p.offerPrice ? calculatePriceWithIVA(p.offerPrice) : null,
      })),
    };

    res.json(formattedProduct);
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  }
}

/**
 * Search products
 */
export async function searchProducts(req: Request, res: Response): Promise<void> {
  try {
    const { q, limit = '10' } = req.query;

    if (!q || typeof q !== 'string') {
      res.json({ products: [], categories: [], brands: [] });
      return;
    }

    const limitNum = parseInt(limit as string, 10);

    // Search products using regex for partial matching
    const searchRegex = new RegExp(q, 'i'); // Case-insensitive partial match
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
      ],
      status: 'active',
    })
      .limit(limitNum)
      .select('name slug images basePrice offerPrice stock brand')
      .lean();

    // Search categories
    const categories = await Category.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { slug: new RegExp(q, 'i') },
      ],
      status: 'active',
    })
      .limit(5)
      .select('name slug')
      .lean();

    // Get unique brands from products
    const brands = await Product.distinct('brand', {
      brand: new RegExp(q, 'i'),
      status: 'active',
    });

    const formattedProducts = products.map((product: any) => ({
      ...product,
      priceWithIVA: calculatePriceWithIVA(product.basePrice),
      offerPriceWithIVA: product.offerPrice
        ? calculatePriceWithIVA(product.offerPrice)
        : null,
    }));

    res.json({
      products: formattedProducts,
      categories,
      brands: brands.filter(Boolean).slice(0, 5), // Limit to 5 brands
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
}

