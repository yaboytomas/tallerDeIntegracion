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
    console.log('=== ADD TO CART REQUEST ===');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    console.log('Cookies:', req.cookies);
    console.log('Headers x-session-id:', req.headers['x-session-id']);
    
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user?.userId;
    
    // Get or create sessionId (prefer header over cookie for cross-origin)
    let sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId;
    
    // For guest users, always ensure we have a valid sessionId
    if (!userId) {
      if (!sessionId || sessionId === '' || sessionId === 'null' || sessionId === 'undefined') {
        sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('Generated new sessionId for guest:', sessionId);
      } else {
        console.log('Using existing sessionId for guest:', sessionId);
      }
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
    } else {
      // Guest user - must have valid sessionId
      if (!sessionId) {
        throw new CustomError('Session ID requerido para usuarios invitados', 400);
      }
      query.sessionId = sessionId;
      query.userId = null; // Explicitly set to null for guest users
    }
    
    // Handle variant (explicitly set to null if not provided)
    if (variantId) {
      query.variantId = variantId;
    } else {
      query.variantId = null;
    }

    console.log('Searching for existing cart item with query:', JSON.stringify(query, null, 2));

    let cartItem = await CartItem.findOne(query);

    if (cartItem) {
      // Update quantity
      console.log('Found existing cart item, updating quantity from', cartItem.quantity, 'to', cartItem.quantity + quantity);
      cartItem.quantity += quantity;
      await cartItem.save();
      console.log('✅ Successfully updated cart item');
    } else {
      // Create new cart item
      console.log('Creating new cart item');
      
      // Prepare cart data with explicit values
      const cartData: any = {
        productId,
        quantity,
        variantId: variantId || null,
      };
      
      if (userId) {
        cartData.userId = userId;
        // Don't set sessionId at all for logged-in users
      } else {
        cartData.sessionId = sessionId;
        // Don't set userId at all for guest users (let default handle it)
      }
      
      console.log('Cart data to create:', JSON.stringify(cartData, null, 2));
      
      try {
        const createdItem = await CartItem.create(cartData);
        cartItem = Array.isArray(createdItem) ? createdItem[0] : createdItem;
        console.log('✅ Successfully created cart item:', cartItem?._id);
      } catch (createError: any) {
        console.error('❌ Error creating cart item:', createError.message);
        console.error('Error code:', createError.code);
        console.error('Error name:', createError.name);
        
        // If duplicate key error, try to find and update existing item
        if (createError.code === 11000) {
          console.log('⚠️ Duplicate key error detected, attempting to find and update existing item');
          cartItem = await CartItem.findOne(query);
          if (cartItem) {
            console.log('Found existing item, updating quantity');
            cartItem.quantity += quantity;
            await cartItem.save();
            console.log('✅ Successfully updated existing item');
          } else {
            // Item exists but couldn't find it - this shouldn't happen
            // Try one more time with a fresh query
            console.log('⚠️ Could not find duplicate item, retrying...');
            await new Promise<void>(resolve => setTimeout(resolve, 100)); // Small delay
            cartItem = await CartItem.findOne(query);
            if (cartItem) {
              cartItem.quantity += quantity;
              await cartItem.save();
              console.log('✅ Successfully updated item on retry');
            } else {
              throw new CustomError('Error al agregar producto al carrito. Por favor intente nuevamente.', 409);
            }
          }
        } else {
          // Some other database error
          throw createError;
        }
      }
    }

    // Set session cookie and return sessionId for guest users
    if (!userId && sessionId) {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' as const : 'lax' as const,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      };
      
      console.log('Setting session cookie with options:', { 
        sessionId, 
        isProduction, 
        ...cookieOptions 
      });
      
      res.cookie('sessionId', sessionId, cookieOptions);
    }

    console.log('✅ Successfully added to cart, returning response');
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

