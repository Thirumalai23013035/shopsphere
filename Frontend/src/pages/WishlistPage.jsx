import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Star, 
  Check, 
  Tag, 
  Sparkles, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const [actionMessage, setActionMessage] = useState(null);
  const [movingItems, setMovingItems] = useState({});

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage(null);
    }, 3000);
  };

  const handleMoveToCart = async (item) => {
    const product = item.product || item;
    const productId = product._id || item.productId || item._id;

    setMovingItems((prev) => ({ ...prev, [productId]: true }));

    try {
      await addToCart(product, 1);
      await removeFromWishlist(productId);
      showNotification(`Moved "${product.name || 'Product'}" to your cart!`);
    } catch (err) {
      console.error('Failed to move item to cart:', err);
    } finally {
      setMovingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCartKeepWishlist = async (item) => {
    const product = item.product || item;
    const productId = product._id || item.productId || item._id;

    setMovingItems((prev) => ({ ...prev, [`add_${productId}`]: true }));

    try {
      await addToCart(product, 1);
      showNotification(`Added "${product.name || 'Product'}" to cart!`);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    } finally {
      setMovingItems((prev) => ({ ...prev, [`add_${productId}`]: false }));
    }
  };

  const handleRemove = async (item) => {
    const product = item.product || item;
    const targetId = item._id || item.productId || product._id;
    await removeFromWishlist(targetId);
    showNotification(`Removed item from wishlist.`);
  };

  const handleMoveAllToCart = async () => {
    if (wishlist.length === 0) return;

    for (const item of wishlist) {
      const product = item.product || item;
      await addToCart(product, 1);
    }

    await clearWishlist();
    showNotification(`Moved all ${wishlist.length} items to your shopping cart!`);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500">Loading your saved items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{actionMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-2">
            <Heart className="w-4 h-4 fill-rose-500" />
            Your Personal Collection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Saved Wishlist</h1>
          <p className="text-xs text-slate-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later consideration
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Move All to Cart
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Clear Wishlist
            </button>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const product = item.product || item;
            const productId = product._id || item.productId || item._id;
            const isMoving = movingItems[productId];
            const isAdding = movingItems[`add_${productId}`];

            return (
              <div
                key={item._id || productId}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition overflow-hidden flex flex-col justify-between group relative"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Layers className="w-10 h-10" />
                    </div>
                  )}

                  {/* Remove Button Badge */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    title="Remove from wishlist"
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-600 hover:bg-white rounded-full shadow-xs transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Category Pill */}
                  {product.category && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3 text-indigo-400" />
                      {product.category}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {product.brand && (
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {product.brand}
                      </p>
                    )}
                    <Link
                      to={`/product/${productId}`}
                      className="font-bold text-slate-900 hover:text-indigo-600 transition text-sm line-clamp-2 flex items-center justify-between group/link"
                    >
                      <span>{product.name || 'Product Name'}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/link:text-indigo-600 shrink-0 opacity-0 group-hover/link:opacity-100 transition" />
                    </Link>

                    {/* Price and Rating */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-lg font-extrabold text-slate-900">
                        ${Number(product.price || 0).toFixed(2)}
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-800">
                            {Number(product.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isMoving}
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {isMoving ? 'Moving...' : 'Move to Cart'}
                    </button>

                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={() => handleAddToCartKeepWishlist(item)}
                      className="w-full py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      {isAdding ? 'Adding...' : '+ Add to Cart (Keep Saved)'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-rose-500/20" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
            Explore our product catalog and save your top items by clicking the heart icon on any product card.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
