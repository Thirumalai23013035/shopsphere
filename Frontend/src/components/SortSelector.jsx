import React from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  Star, 
  Sparkles, 
  SlidersHorizontal,
  Check
} from 'lucide-react';

export const SORT_OPTIONS = [
  { 
    id: 'featured', 
    label: 'Featured', 
    shortLabel: 'Featured', 
    icon: ArrowUpDown, 
    description: 'Default store ordering' 
  },
  { 
    id: 'price-asc', 
    label: 'Price: Low to High', 
    shortLabel: 'Price: Low-High', 
    icon: ArrowUp, 
    description: 'Lowest price first' 
  },
  { 
    id: 'price-desc', 
    label: 'Price: High to Low', 
    shortLabel: 'Price: High-Low', 
    icon: ArrowDown, 
    description: 'Highest price first' 
  },
  { 
    id: 'popularity', 
    label: 'Popularity', 
    shortLabel: 'Popular', 
    icon: TrendingUp, 
    description: 'Most popular & bestsellers' 
  },
  { 
    id: 'rating', 
    label: 'Customer Rating', 
    shortLabel: 'Top Rated', 
    icon: Star, 
    description: 'Highest customer reviews' 
  },
  { 
    id: 'newest', 
    label: 'Newest Arrivals', 
    shortLabel: 'Newest', 
    icon: Sparkles, 
    description: 'Recently added products' 
  },
];

/**
  * Utility function to sort an array of products client-side if needed
  */
export const sortProductsArray = (productsList = [], sortKey = 'featured') => {
  if (!Array.isArray(productsList)) return [];
  const list = [...productsList];

  switch (sortKey) {
    case 'price-asc':
      return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    case 'price-desc':
      return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    case 'popularity':
      return list.sort((a, b) => {
        const ratingA = Number(a.rating) || 0;
        const ratingB = Number(b.rating) || 0;
        const reviewsA = Array.isArray(a.reviews) ? a.reviews.length : (Number(a.reviews) || 0);
        const reviewsB = Array.isArray(b.reviews) ? b.reviews.length : (Number(b.reviews) || 0);
        return (ratingB * 10 + reviewsB) - (ratingA * 10 + reviewsA);
      });
    case 'rating':
      return list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    case 'newest':
      return list.sort((a, b) => {
        const idA = a._id || a.id || '';
        const idB = b._id || b.id || '';
        return idB.localeCompare(idA);
      });
    case 'featured':
    default:
      return list;
  }
};

const SortSelector = ({
  currentSort = 'featured',
  onSortChange,
  variant = 'dropdown', // 'dropdown' | 'pills' | 'compact'
  className = '',
  label = 'Sort by:'
}) => {
  const handleSelect = (sortId) => {
    if (onSortChange) {
      onSortChange(sortId);
    }
  };

  // Variant 1: Compact Styled Dropdown
  if (variant === 'dropdown') {
    const selectedOption = SORT_OPTIONS.find((opt) => opt.id === currentSort) || SORT_OPTIONS[0];

    return (
      <div className={`relative inline-flex items-center gap-2 ${className}`}>
        {label && (
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
            {label}
          </span>
        )}
        <div className="relative flex items-center">
          <select
            value={currentSort}
            onChange={(e) => handleSelect(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-9 pr-8 py-2.5 shadow-2xs hover:border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer transition"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <selectedOption.icon className="w-3.5 h-3.5 text-indigo-600 absolute left-3 pointer-events-none" />
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
        </div>
      </div>
    );
  }

  // Variant 2: Horizontal Pills (Great for sticky toolbars)
  if (variant === 'pills') {
    return (
      <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none ${className}`}>
        {label && (
          <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">
            {label}
          </span>
        )}
        {SORT_OPTIONS.map((opt) => {
          const isSelected = currentSort === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 3: Minimal Button Group
  return (
    <div className={`inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 ${className}`}>
      {SORT_OPTIONS.map((opt) => {
        const isSelected = currentSort === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSelect(opt.id)}
            title={opt.description}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 ${
              isSelected
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{opt.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SortSelector;
