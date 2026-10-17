import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight, Tag, Package } from 'lucide-react';
import api from '../services/api';

const SearchBar = ({ 
  placeholder = "Search products by name, category, brand...", 
  className = "", 
  inputClassName = "",
  compact = false,
  onSelectProduct = null
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search results from backend API
  const fetchSearchResults = async (searchKeyword) => {
    if (!searchKeyword || searchKeyword.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    const trimmed = searchKeyword.trim();
    setLoading(true);
    setError(null);

    try {
      // Primary search endpoint: /products/search?keyword=...
      let fetchedProducts = [];
      try {
        const res = await api.get(`/products/search?keyword=${encodeURIComponent(trimmed)}`);
        if (res.data) {
          if (Array.isArray(res.data.products)) {
            fetchedProducts = res.data.products;
          } else if (Array.isArray(res.data)) {
            fetchedProducts = res.data;
          }
        }
      } catch (err) {
        // Fallback to /products?search=... if search route throws 404
        try {
          const fallbackRes = await api.get(`/products?search=${encodeURIComponent(trimmed)}`);
          const data = fallbackRes.data;
          fetchedProducts = Array.isArray(data) ? data : (data.products || []);
        } catch (fallbackErr) {
          console.error('Search API error:', fallbackErr);
        }
      }

      setResults(fetchedProducts.slice(0, 6)); // Limit preview to top 6 items
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Failed to search products:', err);
      setError('Search error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(() => {
      fetchSearchResults(value);
    }, 300);
  };

  // Execute search submission
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      handleProductSelect(results[selectedIndex]);
      return;
    }

    if (query.trim()) {
      setIsOpen(false);
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Navigate to product detail page
  const handleProductSelect = (product) => {
    setIsOpen(false);
    setQuery('');
    const productId = product._id || product.id;
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  // Clear query
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Helper to highlight matching text in name
  const renderHighlightedName = (name, searchKey) => {
    if (!searchKey) return name;
    const parts = name.split(new RegExp(`(${searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === searchKey.toLowerCase() ? (
            <mark key={i} className="bg-amber-100 text-amber-900 font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 2 && results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search products"
          className={`w-full pl-10 pr-10 py-2 text-sm text-slate-800 placeholder-slate-400 bg-slate-100/80 border border-slate-200 rounded-full focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition shadow-2xs ${inputClassName}`}
        />
        
        {/* Search Icon */}
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Action button (Clear or Loading indicator) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading ? (
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </form>

      {/* Instant Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {results.length > 0 ? (
              <>
                <div className="px-4 py-2 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                  <span>Product Suggestions</span>
                  <span>{results.length} found</span>
                </div>
                {results.map((product, index) => {
                  const isSelected = index === selectedIndex;
                  const imageUrl = product.imageURL || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=60';
                  
                  return (
                    <button
                      key={product._id || product.id || index}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left p-3 flex items-center gap-3 transition ${
                        isSelected ? 'bg-indigo-50/80 text-indigo-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=60';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate text-slate-900">
                            {renderHighlightedName(product.name, query.trim())}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          {product.category && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              <Tag className="w-3 h-3 text-slate-400" />
                              {product.category}
                            </span>
                          )}
                          {product.brand && (
                            <span className="text-slate-400">• {product.brand}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-indigo-600">
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* View All Results Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full p-3 bg-slate-50 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-semibold text-xs flex items-center justify-center gap-2 transition border-t border-slate-100"
                >
                  <span>See all products matching "{query}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : !loading && query.trim().length >= 2 ? (
              <div className="p-6 text-center text-slate-500">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No products found matching "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Try checking spelling or search with different keywords.</p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition"
                >
                  View Catalog
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
