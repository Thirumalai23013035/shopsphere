import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Review from '../components/Review';
import {
  Heart,
  ShoppingBag,
  Check,
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  const isWishlisted = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await api.get(`/products/${id}`);
        // Backend wraps the product in res.data.product
        const productData = res.data?.product || res.data;
        setProduct(productData);

      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setAddingCart(true);
      await addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isWishlisted) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link
          to="/products"
          className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const imageUrl = (product.imageURL || product.image)
    ? (product.imageURL || product.image).startsWith('http')
      ? (product.imageURL || product.image)
      : `/${product.imageURL || product.image}`
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-12 pb-12">
      {/* Product Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Product Meta */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {product.category && (
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
              )}
              {product.brand && (
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-extrabold text-slate-900">
                ${Number(product.price || 0).toFixed(2)}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  product.stock > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              {product.description || 'No description provided for this product.'}
            </p>
          </div>

          {/* Action Bar */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingCart || product.stock === 0}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                  product.stock === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-xl border transition ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Delivery Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-slate-100">
              <div className="p-2 text-slate-500">
                <Truck className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <span className="text-[10px] font-medium block">Fast Shipping</span>
              </div>
              <div className="p-2 text-slate-500">
                <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <span className="text-[10px] font-medium block">Verified Quality</span>
              </div>
              <div className="p-2 text-slate-500">
                <RotateCcw className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <span className="text-[10px] font-medium block">30 Day Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <Review productId={product._id} />
    </div>
  );
};

export default ProductDetail;
