import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products?limit=8');
        const items = Array.isArray(res.data)
          ? res.data
          : res.data?.products || [];
        setFeaturedProducts(items);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 md:p-16 shadow-lg">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Curated E-Commerce Collection
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Elevate Your Everyday Shopping with <span className="text-indigo-400">ShopSphere</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Discover premium products, seamless JWT checkout, real-time cart tracking, and verified reviews powered by our full-stack MERN platform.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/wishlist"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition"
            >
              Saved Items
            </Link>
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Shop by Category</h2>
          <Link to="/products" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All Catalog <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <CategoryFilter
          variant="grid"
          onSelectCategory={(cat) => {
            if (cat) {
              navigate(`/products?category=${encodeURIComponent(cat)}`);
            } else {
              navigate('/products');
            }
          }}
        />
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Featured Catalog</h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-indigo-600 hover:underline">
            Browse All Products ({featuredProducts.length})
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              📦
            </div>
            <h3 className="text-base font-bold text-slate-800">No products available yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add new products using the Admin Portal or start exploring categories.
            </p>
            <Link
              to="/products"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
            >
              Go to Product Catalog
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
