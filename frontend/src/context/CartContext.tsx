import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import type { Cart } from '../types';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const cartData = await api.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart({ items: [], subtotal: 0, iva: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, variantId?: string, quantity: number = 1) => {
    try {
      console.log('📦 CartContext: Adding to cart...', { productId, variantId, quantity });
      await api.addToCart(productId, variantId, quantity);
      console.log('✅ CartContext: Item added, refreshing cart...');
      await refreshCart();
      console.log('✅ CartContext: Cart refreshed successfully');
    } catch (error: any) {
      console.error('❌ Error adding to cart:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      await api.updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (error: any) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.removeFromCart(itemId);
      await refreshCart();
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, iva: 0, total: 0 });
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value: CartContextType = {
    cart,
    loading,
    itemCount,
    refreshCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

