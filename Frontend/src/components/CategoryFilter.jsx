import React, { useState, useEffect } from 'react';
import { Layers, Loader2, Check, Tag, ChevronRight, Grid } from 'lucide-react';
import api from '../services/api';

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Footwear',
  'Home & Kitchen',
  'Accessories',
  'Beauty'
];

const CategoryFilter = ({
  selectedCategory = '',
  onSelectCategory,
  variant = 'pills', // 'pills' | 'list' | 'grid' | 'dropdown'
  className = '',
  showAllOption = true,
  allLabel = 'All Categories'
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try fetching dedicated categories route
        let fetchedList = [];
        try {
          const res = await api.get('/products/categories');
          if (res.data && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
            fetchedList = res.data.categories;
          }
        } catch (catErr) {
          console.warn('Dedicated /products/categories route failed, trying fallback...', catErr);
        }

        // Fallback: derive categories from products list if /categories is empty
        if (fetchedList.length === 0) {
          try {
            const prodRes = await api.get('/products');
            let prods = [];
            if (Array.isArray(prodRes.data)) prods = prodRes.data;
            else if (prodRes.data && Array.isArray(prodRes.data.products)) prods = prodRes.data.products;

            const extracted = Array.from(
              new Set(prods.map((p) => p.category).filter(Boolean))
            );
            if (extracted.length > 0) {
              fetchedList = extracted;
            }
          } catch (prodErr) {
            console.error('Fallback product fetch error:', prodErr);
          }
        }

        // Final fallback to defaults if still empty
        if (fetchedList.length === 0) {
          fetchedList = DEFAULT_CATEGORIES;
        }

        if (isMounted) {
          setCategories(fetchedList);
        }
      } catch (err) {
        console.error('CategoryFilter fetch error:', err);
        if (isMounted) {
          setError('Failed to load categories');
          setCategories(DEFAULT_CATEGORIES);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelect = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-slate-400 text-xs py-2 ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
        <span>Loading categories...</span>
      </div>
    );
  }

  // Variant 1: Horizontal Pills Bar
  if (variant === 'pills') {
    return (
      <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none ${className}`}>
        {showAllOption && (
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
              !selectedCategory
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {allLabel}
          </button>
        )}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 2: Vertical List (Ideal for sidebars)
  if (variant === 'list') {
    return (
      <div className={`space-y-1 ${className}`}>
        {showAllOption && (
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition flex items-center justify-between ${
              !selectedCategory
                ? 'bg-indigo-50 font-bold text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Grid className="w-3.5 h-3.5 text-slate-400" />
              {allLabel}
            </span>
            {!selectedCategory && <Check className="w-3.5 h-3.5 text-indigo-600" />}
          </button>
        )}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition flex items-center justify-between ${
                isSelected
                  ? 'bg-indigo-50 font-bold text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {cat}
              </span>
              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 3: Visual Grid Cards
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 ${className}`}>
        {showAllOption && (
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 ${
              !selectedCategory
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-102'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-xs font-bold">{allLabel}</span>
          </button>
        )}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-102'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-5 h-5" />
              <span className="text-xs font-bold truncate w-full">{cat}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 4: Dropdown Select
  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedCategory}
        onChange={(e) => handleSelect(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-600 focus:outline-none transition"
      >
        {showAllOption && <option value="">{allLabel}</option>}
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
