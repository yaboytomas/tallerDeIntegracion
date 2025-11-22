import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { CustomError } from '../middleware/errorHandler';

/**
 * Get all categories
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const { parentId, status } = req.query;

    const query: any = {};

    if (parentId === 'null' || parentId === '') {
      query.parentId = null;
    } else if (parentId) {
      query.parentId = parentId;
    }

    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    const categories = await Category.find(query)
      .populate('parentId', 'name slug')
      .sort({ order: 1, name: 1 })
      .lean();

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
}

/**
 * Get single category by slug
 */
export async function getCategory(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug })
      .populate('parentId', 'name slug')
      .lean();

    if (!category) {
      throw new CustomError('Categoría no encontrada', 404);
    }

    res.json(category);
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener categoría' });
    }
  }
}

