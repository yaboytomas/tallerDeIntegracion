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
    
    // Get or create sessionId (prefer header over cookie for cross-origin)
    let sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId;
    if (!userId && !sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    console.log('Session info:', { 
      userId, 
      sessionId, 
      hasHeaderSession: !!req.headers['x-session-id'],
      hasCookieSession: !!req.cookies?.sessionId 
    });

    if (!productId) {
      throw new CustomError('Product ID requerido', 400);
    }

    // Validate MongoDB ObjectId format
    const { Types } = require('mongoose');
    if (!Types.ObjectId.isValid(productId)) {
      console.error('Invalid product ID format:', productId);
      throw new CustomError('ID de producto inválido', 400);
    }
    
    console.log('Adding to cart:', { productId, variantId, quantity, userId, sessionId });

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

    // Build query based on user type
    let query: any = { productId };
    
    if (userId) {
      // Logged-in user
      query.userId = userId;
      query.sessionId = null;
    } else {
      // Guest user
      query.userId = null;
      query.sessionId = sessionId;
    }
    
    // Handle variant
    query.variantId = variantId || null;

    console.log('Searching for existing cart item with query:', query);

    let cartItem = await CartItem.findOne(query);

    if (cartItem) {
      // Update quantity
      console.log('Found existing cart item, updating quantity');
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item
      console.log('Creating new cart item');
      
      // IMPORTANT: Clean up any orphaned cart items first
      // (items with userId: null but no valid sessionId)
      if (!userId) {
        console.log('Cleaning up orphaned cart items for product:', productId);
        await CartItem.deleteMany({
          userId: null,
          sessionId: { $in: [null, ''] },
          productId,
          variantId: variantId || null,
        });
      }
      
      const cartData: any = {
        productId,
        quantity,
      };
      
      if (userId) {
        cartData.userId = userId;
        cartData.sessionId = null;
      } else {
        if (!sessionId) {
          throw new CustomError('Session ID requerido para usuarios invitados', 400);
        }
        cartData.userId = null;
        cartData.sessionId = sessionId;
      }
      
      if (variantId) {
        cartData.variantId = variantId;
      } else {
        cartData.variantId = null;
      }
      
      try {
        const createdItem = await CartItem.create(cartData);
        cartItem = Array.isArray(createdItem) ? createdItem[0] : createdItem;
      } catch (createError: any) {
        // If still duplicate key error, find and update existing item
        if (createError.code === 11000) {
          console.log('Duplicate key error, finding and updating existing item');
          cartItem = await CartItem.findOne(query);
          if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
          } else {
            // Last resort: delete the duplicate and retry
            console.log('Last resort: deleting duplicates and retrying');
            await CartItem.deleteMany({
              userId: userId || null,
              sessionId: userId ? null : sessionId,
              productId,
              variantId: variantId || null,
            });
            const retryItem = await CartItem.create(cartData);
            cartItem = Array.isArray(retryItem) ? retryItem[0] : retryItem;
          }
        } else {
          throw createError;
        }
      }
    }

    // Set session cookie if not logged in
    if (!userId) {
      console.log('Setting session cookie:', sessionId);
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    res.status(201).json({
      message: 'Producto agregado al carrito',
      cartItem,
      sessionId: !userId ? sessionId : undefined, // Return sessionId for guest users
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('❌ Add to cart error:', error);
      console.error('📦 Request body:', req.body);
      console.error('🔑 User:', req.user);
      console.error('🍪 Cookies:', req.cookies);
      console.error('📋 Headers:', req.headers);
      console.error('📚 Stack:', error.stack);
      console.error('💥 Error name:', error.name);
      console.error('💬 Error message:', error.message);
      console.error('🔍 Error code:', error.code);
      res.status(500).json({ 
        error: 'Error al agregar al carrito', 
        details: error.message,
        code: error.code 
      });
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

