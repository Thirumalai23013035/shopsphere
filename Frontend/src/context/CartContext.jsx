import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const getCartStorageKey = (userId) => (userId ? `ecom_cart_items_${userId}` : null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [items, setItems] = useState(() => {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`ecom_cart_items_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart items from localStorage:', e);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Clean up legacy shared cart keys from localStorage if any exist
  useEffect(() => {
    try {
      localStorage.removeItem('ecom_cart_items_v1');
      localStorage.removeItem('ecom_cart_items_guest');
    } catch (e) {}
  }, []);

  // Sync state to user-scoped localStorage
  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    try {
      localStorage.setItem(`ecom_cart_items_${userId}`, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart items to localStorage:', e);
    }
  }, [items, userId]);

  // Fetch server cart if user is authenticated
  const fetchServerCart = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      let serverItems = [];
      
      if (res.data) {
        if (Array.isArray(res.data.cart)) {
          serverItems = res.data.cart;
        } else if (Array.isArray(res.data.items)) {
          serverItems = res.data.items;
        } else if (Array.isArray(res.data)) {
          serverItems = res.data;
        }
      }

      const normalized = serverItems.map((item) => {
        const productObj = item.productId && typeof item.productId === 'object' ? item.productId : item.product || {};
        const productId = productObj._id || item.productId || item._id;
        return {
          _id: item._id || productId,
          productId: productId,
          product: {
            _id: productId,
            name: productObj.name || item.name || 'Product',
            price: Number(productObj.price || item.price || 0),
            image: productObj.image || productObj.imageURL || item.image || '',
            category: productObj.category || '',
            brand: productObj.brand || '',
            stock: productObj.stock ?? 99
          },
          price: Number(productObj.price || item.price || 0),
          quantity: Number(item.quantity || 1)
        };
      });

      setItems(normalized);
    } catch (error) {
      console.error('Error fetching cart from backend:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Switch cart items whenever logged-in user changes (or logs out)
  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }

    try {
      const saved = localStorage.getItem(`ecom_cart_items_${userId}`);
      setItems(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setItems([]);
    }

    fetchServerCart();
  }, [userId, fetchServerCart]);

  /**
   * Add product to cart
   * @param {string|object} productOrId - Product object or Product ID
   * @param {number} quantity - Quantity to add
   * @param {object} productMeta - Optional fallback product metadata
   */
  const addToCart = async (productOrId, quantity = 1, productMeta = null) => {
    if (!userId) return false;
    let targetId = '';
    let productData = null;

    if (typeof productOrId === 'object' && productOrId !== null) {
      targetId = productOrId._id || productOrId.id;
      productData = productOrId;
    } else {
      targetId = String(productOrId);
      productData = productMeta;
    }

    if (!targetId) return false;

    // Update local state first for immediate UI feedback & local persistence
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === targetId || item._id === targetId || item.product?._id === targetId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentQty = updated[existingIndex].quantity || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + quantity
        };
        return updated;
      } else {
        const newItem = {
          _id: `local_${targetId}_${Date.now()}`,
          productId: targetId,
          quantity: quantity,
          price: Number(productData?.price || 0),
          product: {
            _id: targetId,
            name: productData?.name || 'Product',
            price: Number(productData?.price || 0),
            image: productData?.image || productData?.imageURL || '',
            category: productData?.category || '',
            brand: productData?.brand || '',
            stock: productData?.stock ?? 99
          }
        };
        return [...prevItems, newItem];
      }
    });

    // If logged in, send request to API
    if (user) {
      try {
        await api.post('/cart/add', { productId: targetId, quantity });
        // Optionally refetch server cart to sync database IDs
        fetchServerCart();
      } catch (err) {
        console.error('Error syncing add to cart with server:', err);
      }
    }

    return true;
  };

  /**
   * Update quantity directly for a specific cart item
   */
  const updateQuantity = async (itemIdOrProductId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(itemIdOrProductId);
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === itemIdOrProductId || item.productId === itemIdOrProductId || item.product?._id === itemIdOrProductId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  /**
   * Increase quantity by 1
   */
  const increaseQuantity = async (itemIdOrProductId) => {
    const targetItem = items.find(
      (item) => item._id === itemIdOrProductId || item.productId === itemIdOrProductId || item.product?._id === itemIdOrProductId
    );

    if (!targetItem) return;

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === itemIdOrProductId || item.productId === itemIdOrProductId || item.product?._id === itemIdOrProductId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );

    if (user && targetItem._id && !targetItem._id.startsWith('local_')) {
      try {
        await api.post(`/cart/inc/${targetItem._id}`);
      } catch (err) {
        console.error('API increase error:', err);
      }
    }
  };

  /**
   * Decrease quantity by 1 (removes if quantity reaches 0)
   */
  const decreaseQuantity = async (itemIdOrProductId) => {
    const targetItem = items.find(
      (item) => item._id === itemIdOrProductId || item.productId === itemIdOrProductId || item.product?._id === itemIdOrProductId
    );

    if (!targetItem) return;

    if (targetItem.quantity <= 1) {
      return removeFromCart(itemIdOrProductId);
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === itemIdOrProductId || item.productId === itemIdOrProductId || item.product?._id === itemIdOrProductId) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );

    if (user && targetItem._id && !targetItem._id.startsWith('local_')) {
      try {
        await api.post(`/cart/dec/${targetItem._id}`);
      } catch (err) {
        console.error('API decrease error:', err);
      }
    }
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = async (itemIdOrProductId) => {
    const targetItem = items.find(
      (item) => item._id === itemIdOrProductId || item.productId === itemIdOrProductId || item.product?._id === itemIdOrProductId
    );

    setItems((prevItems) =>
      prevItems.filter(
        (item) => item._id !== itemIdOrProductId && item.productId !== itemIdOrProductId && item.product?._id !== itemIdOrProductId
      )
    );

    if (user && targetItem?._id && !targetItem._id.startsWith('local_')) {
      try {
        await api.delete(`/cart/${targetItem._id}`);
      } catch (err) {
        console.error('API remove item error:', err);
      }
    }
  };

  /**
   * Clear all items in cart
   */
  const clearCart = async () => {
    setItems([]);
    try {
      localStorage.removeItem(getCartStorageKey(userId));
    } catch (e) {
      console.error(e);
    }

    if (user) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.error('API clear cart error:', err);
      }
    }
  };

  // Calculate totals
  const cartItemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.product?.price || item.price || 0);
    const qty = Number(item.quantity) || 1;
    return sum + price * qty;
  }, 0);

  // Cart wrapper object to support cart.items access pattern
  const cart = {
    items: items,
    totalPrice: totalPrice,
    count: cartItemCount
  };

  const value = {
    cart,
    cartItems: items,
    totalPrice,
    loading,
    cartItemCount,
    fetchCart: fetchServerCart,
    addToCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
