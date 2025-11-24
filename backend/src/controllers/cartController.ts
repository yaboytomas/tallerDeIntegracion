import { Response } from 'express';
import { CartItem } from '../models/CartItem';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { AuthRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { calculatePriceWithIVA } from '../utils/currency';
import { sendQuotationRequestToCustomer, sendQuotationRequestToAdmin } from '../services/emailService';

/**
 * Get user cart
 */
export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

    if (!userId && !sessionId) {
      res.json({ items: [], subtotal: 0, iva: 0, total: 0 });
      return;
    }

    const query: any = userId ? { userId } : { sessionId };

    const cartItems = await CartItem.find(query)
      .populate('productId')
      .populate('variantId')
      .lean();

    // Calculate totals
    let subtotal = 0;
    const items = [];

    for (const item of cartItems) {
      const product = item.productId as any;
      const variant = item.variantId as any;

      if (!product || product.status !== 'active') {
        continue;
      }

      const basePrice = product.basePrice + (variant?.priceModifier || 0);
      const priceWithIVA = calculatePriceWithIVA(basePrice);
      const itemSubtotal = priceWithIVA * item.quantity;

      subtotal += itemSubtotal;

      items.push({
        id: item._id,
        product: {
          id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images,
          sku: product.sku,
        },
        variant: variant
          ? {
              id: variant._id,
              name: variant.name,
              value: variant.value,
            }
          : null,
        quantity: item.quantity,
        price: priceWithIVA,
        subtotal: itemSubtotal,
        stock: variant ? variant.stock : product.stock,
      });
    }

    const iva = Math.round(subtotal * 0.19);
    const total = subtotal;

    res.json({
      items,
      subtotal,
      iva,
      total,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
}

/**
 * Add item to cart
 */
export async function addToCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] || `session-${Date.now()}`;

    if (!productId) {
      throw new CustomError('Product ID requerido', 400);
    }

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      throw new CustomError('Producto no encontrado', 404);
    }

    // Verify variant if provided
    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (!variant || variant.productId.toString() !== productId) {
        throw new CustomError('Variante no encontrada', 404);
      }
      if (variant.stock < quantity) {
        throw new CustomError('Stock insuficiente', 400);
      }
    } else {
      if (product.stock < quantity) {
        throw new CustomError('Stock insuficiente', 400);
      }
    }

    // Find existing cart item
    const query: any = { productId };
    if (userId) {
      query.userId = userId;
    } else {
      query.sessionId = sessionId;
    }
    if (variantId) {
      query.variantId = variantId;
    } else {
      query.variantId = null;
    }

    let cartItem = await CartItem.findOne(query);

    if (cartItem) {
      // Update quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        userId: userId || undefined,
        sessionId: userId ? undefined : sessionId,
        productId,
        variantId: variantId || undefined,
        quantity,
      });
    }

    // Set session cookie if not logged in
    if (!userId && !req.cookies?.sessionId) {
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    res.status(201).json({
      message: 'Producto agregado al carrito',
      cartItem,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Add to cart error:', error);
      res.status(500).json({ error: 'Error al agregar al carrito' });
    }
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

    if (!quantity || quantity < 1) {
      throw new CustomError('Cantidad inválida', 400);
    }

    const query: any = { _id: id };
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      throw new CustomError('No autorizado', 401);
    }

    const cartItem = await CartItem.findOne(query).populate('productId').populate('variantId');

    if (!cartItem) {
      throw new CustomError('Item no encontrado en carrito', 404);
    }

    const product = cartItem.productId as any;
    const variant = cartItem.variantId as any;
    const availableStock = variant ? variant.stock : product.stock;

    if (availableStock < quantity) {
      throw new CustomError('Stock insuficiente', 400);
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      message: 'Carrito actualizado',
      cartItem,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar carrito' });
    }
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

    const query: any = { _id: id };
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      throw new CustomError('No autorizado', 401);
    }

    const result = await CartItem.deleteOne(query);

    if (result.deletedCount === 0) {
      throw new CustomError('Item no encontrado en carrito', 404);
    }

    res.json({ message: 'Item eliminado del carrito' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar del carrito' });
    }
  }
}

/**
 * Request quotation for cart items
 */
export async function requestQuotation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, phone, message } = req.body;
    const userId = req.user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

    // Validate required fields
    if (!name || !email || !phone) {
      throw new CustomError('Nombre, email y teléfono son requeridos', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new CustomError('Email inválido', 400);
    }

    if (!userId && !sessionId) {
      throw new CustomError('Carrito vacío', 400);
    }

    const query: any = userId ? { userId } : { sessionId };

    // Get cart items
    const cartItems = await CartItem.find(query)
      .populate('productId')
      .populate('variantId')
      .lean();

    if (!cartItems || cartItems.length === 0) {
      throw new CustomError('El carrito está vacío', 400);
    }

    // Prepare items for email
    const items = [];
    for (const item of cartItems) {
      const product = item.productId as any;
      const variant = item.variantId as any;

      if (!product || product.status !== 'active') {
        continue;
      }

      const basePrice = product.basePrice + (variant?.priceModifier || 0);
      const priceWithIVA = calculatePriceWithIVA(basePrice);
      const itemSubtotal = priceWithIVA * item.quantity;

      items.push({
        productName: product.name,
        variantName: variant?.name || null,
        quantity: item.quantity,
        price: priceWithIVA,
        subtotal: itemSubtotal,
      });
    }

    if (items.length === 0) {
      throw new CustomError('No hay productos activos en el carrito', 400);
    }

    // Send emails
    await Promise.all([
      sendQuotationRequestToCustomer(name, email, items),
      sendQuotationRequestToAdmin(name, email, phone, message || '', items),
    ]);

    res.json({
      message: 'Solicitud de cotización enviada exitosamente',
      email: email,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Request quotation error:', error);
      res.status(500).json({ error: 'Error al solicitar cotización' });
    }
  }
}

