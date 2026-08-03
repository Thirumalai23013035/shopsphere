import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const LOCAL_STORAGE_KEY = 'ecom_wishlist_items_v1';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse wishlist items from localStorage:', e);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync state to localStorage whenever wishlist updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist items to localStorage:', e);
    }
  }, [wishlist]);

  // Fetch server wishlist if authenticated
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
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

      if (serverItems.length > 0) {
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
      }
    } catch (error) {
      console.error('Error fetching wishlist from server:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /**
   * Check if a product is in wishlist
   */
  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const target = String(productId);
      return wishlist.some((item) => {
        const itemProdId = String(item.product?._id || item.productId || item._id);
        return itemProdId === target;
      });
    },
    [wishlist]
  );

  /**
   * Add a product to wishlist
   * @param {string|object} productOrId - Product object or Product ID string
   */
  const addToWishlist = async (productOrId) => {
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
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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
