import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const getWishlistStorageKey = (userId) => (userId ? `ecom_wishlist_items_${userId}` : null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [wishlist, setWishlist] = useState(() => {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`ecom_wishlist_items_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse wishlist items from localStorage:', e);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Clean up legacy shared wishlist keys from localStorage if any exist
  useEffect(() => {
    try {
      localStorage.removeItem('ecom_wishlist_items_v1');
      localStorage.removeItem('ecom_wishlist_items_guest');
    } catch (e) {}
  }, []);

  // Sync state to user-scoped localStorage
  useEffect(() => {
    if (!userId) {
      setWishlist([]);
      return;
    }
    try {
      localStorage.setItem(`ecom_wishlist_items_${userId}`, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist items to localStorage:', e);
    }
  }, [wishlist, userId]);

  // Fetch server wishlist if authenticated
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      let serverItems = [];

      if (res.data) {
        if (Array.isArray(res.data.items)) {
          serverItems = res.data.items;
        } else if (Array.isArray(res.data.wishlist)) {
          serverItems = res.data.wishlist;
        } else if (Array.isArray(res.data)) {
          serverItems = res.data;
        }
      }

      const normalized = serverItems.map((item) => {
        const productObj = item.product && typeof item.product === 'object' ? item.product : (item.productId && typeof item.productId === 'object' ? item.productId : {});
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
            rating: productObj.rating || 0,
            stock: productObj.stock ?? 99
          }
        };
      });

      setWishlist(normalized);
    } catch (error) {
      console.error('Error fetching wishlist from server:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Switch wishlist items whenever logged-in user changes (or logs out)
  useEffect(() => {
    if (!userId) {
      setWishlist([]);
      return;
    }

    try {
      const saved = localStorage.getItem(`ecom_wishlist_items_${userId}`);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setWishlist([]);
    }

    fetchWishlist();
  }, [userId, fetchWishlist]);

  /**
   * Check if a product is in wishlist
   */
  const isInWishlist = useCallback(
    (productId) => {
      if (!productId || !userId) return false;
      const target = String(productId);
      return wishlist.some((item) => {
        const itemProdId = String(item.product?._id || item.productId || item._id);
        return itemProdId === target;
      });
    },
    [wishlist, userId]
  );

  /**
   * Add a product to wishlist
   * @param {string|object} productOrId - Product object or Product ID string
   */
  const addToWishlist = async (productOrId) => {
    if (!userId) return false;
    let targetId = '';
    let productData = null;

    if (typeof productOrId === 'object' && productOrId !== null) {
      targetId = String(productOrId._id || productOrId.id);
      productData = productOrId;
    } else {
      targetId = String(productOrId);
    }

    if (!targetId) return false;

    // Check if already in wishlist
    if (isInWishlist(targetId)) return true;

    // Add to local state immediately
    const newItem = {
      _id: `wish_${targetId}_${Date.now()}`,
      productId: targetId,
      product: productData ? {
        _id: targetId,
        name: productData.name || 'Product',
        price: Number(productData.price || 0),
        image: productData.image || productData.imageURL || '',
        category: productData.category || '',
        brand: productData.brand || '',
        rating: productData.rating || 0,
        stock: productData.stock ?? 99
      } : { _id: targetId }
    };

    setWishlist((prev) => [...prev, newItem]);

    // If logged in, sync with API
    if (user) {
      try {
        await api.post('/wishlist/add', { productId: targetId });
        fetchWishlist();
      } catch (error) {
        console.error('Error syncing add to wishlist with backend:', error);
      }
    }

    return true;
  };

  /**
   * Remove a product from wishlist
   */
  const removeFromWishlist = async (idOrProductId) => {
    if (!idOrProductId) return;
    const target = String(idOrProductId);

    const targetItem = wishlist.find(
      (item) =>
        String(item._id) === target ||
        String(item.productId) === target ||
        String(item.product?._id) === target
    );

    setWishlist((prev) =>
      prev.filter(
        (item) =>
          String(item._id) !== target &&
          String(item.productId) !== target &&
          String(item.product?._id) !== target
      )
    );

    if (user && targetItem) {
      try {
        const removeId = targetItem._id;
        if (removeId && !removeId.startsWith('wish_')) {
          await api.delete(`/wishlist/${removeId}`);
        } else if (targetItem.productId) {
          await api.delete(`/wishlist/${targetItem.productId}`);
        }
      } catch (error) {
        console.error('Error syncing removal with server:', error);
      }
    }
  };

  /**
   * Toggle product in wishlist (Add if absent, remove if present)
   */
  const toggleWishlist = async (productOrId) => {
    const targetId = typeof productOrId === 'object' && productOrId !== null ? (productOrId._id || productOrId.id) : productOrId;
    if (isInWishlist(targetId)) {
      await removeFromWishlist(targetId);
      return false;
    } else {
      await addToWishlist(productOrId);
      return true;
    }
  };

  /**
   * Clear all wishlist items
   */
  const clearWishlist = async () => {
    setWishlist([]);
    try {
      localStorage.removeItem(getWishlistStorageKey(userId));
    } catch (e) {
      console.error(e);
    }
  };

  const wishlistCount = wishlist.length;

  const value = {
    wishlist,
    wishlistCount,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
