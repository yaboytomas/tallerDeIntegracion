import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { CartItem } from '../models/CartItem';
import { AuthRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';

/**
 * Create a new order from cart
 */
export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    if (!req.user) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.region || !shippingAddress.comuna || 
        !shippingAddress.street || !shippingAddress.number || !shippingAddress.phone) {
      throw new CustomError('Dirección de envío incompleta', 400);
    }

    // Get cart items for user or session
    const cartItems = await CartItem.find({
      $or: [
        { userId: req.user.userId },
        { sessionId: req.cookies?.sessionId || '' }
      ]
    }).populate('productId').populate('variantId').lean();

    if (!cartItems || cartItems.length === 0) {
      throw new CustomError('El carrito está vacío', 400);
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.productId as any;
      const variant = item.variantId as any;

      // Check stock
      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock < item.quantity) {
        throw new CustomError(`Stock insuficiente para ${product.name}`, 400);
      }

      // Calculate price
      const price = variant?.price || product.offerPrice || product.basePrice;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        variantId: variant?._id,
        quantity: item.quantity,
        price: price,
        name: product.name,
        sku: variant?.sku || product.sku,
      });
    }

    // Calculate IVA and total
    const iva = subtotal * 0.19;
    const shipping = 0; // TODO: Calculate shipping based on region/weight
    const total = subtotal + iva + shipping;

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `JSP-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`;

    // Create order
    const order = new Order({
      userId: req.user.userId,
      orderNumber,
      items: orderItems,
      subtotal,
      iva,
      shipping,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'pending',
      status: 'pending',
      paymentStatus: 'pending',
    });

    await order.save();

    // Update product stock
    for (const item of cartItems) {
      const product = item.productId as any;
      const variant = item.variantId as any;

      if (variant) {
        await ProductVariant.findByIdAndUpdate(variant._id, {
          $inc: { stock: -item.quantity }
        });
      } else {
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    // Clear cart
    await CartItem.deleteMany({
      $or: [
        { userId: req.user.userId },
        { sessionId: req.cookies?.sessionId || '' }
      ]
    });

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name slug images')
      .populate('items.variantId', 'name sku')
      .lean();

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      order: populatedOrder
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Error al crear pedido' });
    }
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalOrders] = await Promise.all([
      Order.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('items.productId', 'name slug images')
        .populate('items.variantId', 'name sku')
        .lean(),
      Order.countDocuments({ userId: req.user.userId })
    ]);

    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get user orders error:', error);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  }
}

/**
 * Get single order by ID
 */
export async function getOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId: req.user.userId
    })
      .populate('items.productId', 'name slug images')
      .populate('items.variantId', 'name sku')
      .lean();

    if (!order) {
      throw new CustomError('Pedido no encontrado', 404);
    }

    res.json(order);
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  }
}

/**
 * Cancel order (only if pending)
 */
export async function cancelOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId: req.user.userId
    });

    if (!order) {
      throw new CustomError('Pedido no encontrado', 404);
    }

    if (order.status !== 'pending') {
      throw new CustomError('No se puede cancelar un pedido que ya está en proceso', 400);
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      if (item.variantId) {
        await ProductVariant.findByIdAndUpdate(item.variantId, {
          $inc: { stock: item.quantity }
        });
      } else {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    res.json({ message: 'Pedido cancelado exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Cancel order error:', error);
      res.status(500).json({ error: 'Error al cancelar pedido' });
    }
  }
}
