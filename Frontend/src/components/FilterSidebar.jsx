import React, { useState, useEffect } from 'react';
import CategoryFilter from './CategoryFilter';
import { 
  Filter, 
  X, 
  RefreshCw, 
  Search, 
  DollarSign, 
  Tag, 
  Layers, 
  Star, 
  Check, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PRESET_PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under $25', min: '0', max: '25' },
  { label: '$25 to $50', min: '25', max: '50' },
  { label: '$50 to $100', min: '50', max: '100' },
  { label: '$100 to $200', min: '100', max: '200' },
  { label: '$200 & Above', min: '200', max: '' },
];

const FilterSidebar = ({
  filters = {},
  onFilterChange,
  onReset,
  categoriesList = ['Electronics', 'Fashion', 'Footwear', 'Home & Kitchen', 'Accessories', 'Beauty'],
  brandsList = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Puma', 'Logitech'],
  isOpen = false,
  onClose = () => {},
  totalResults = null
}) => {
  const {
    search = '',
    category = '',
    brand = '',
    minPrice = '',
    maxPrice = '',
    rating = '',
    inStock = false,
  } = filters;

  // Local state for smooth slider / input editing before applying if needed
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    brand: true,
    rating: false
  });

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceApply = (e) => {
    e?.preventDefault();
    onFilterChange({
      ...filters,
      minPrice: localMin,
      maxPrice: localMax
    });
  };

  const handleSelectPresetPrice = (preset) => {
    setLocalMin(preset.min);
    setLocalMax(preset.max);
    onFilterChange({
      ...filters,
      minPrice: preset.min,
      maxPrice: preset.max
    });
  };

  const isPresetActive = (preset) => {
    return String(localMin || '') === String(preset.min) && String(localMax || '') === String(preset.max);
  };

  const activeFiltersCount = [
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock ? 'inStock' : ''
  ].filter(Boolean).length;

  const SidebarContent = (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {category && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
              Cat: {category}
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, category: '' })}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {brand && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
              Brand: {brand}
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, brand: '' })}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-100">
              Price: ${minPrice || '0'} - ${maxPrice || '∞'}
              <button
                type="button"
                onClick={() => {
                  setLocalMin('');
                  setLocalMax('');
                  onFilterChange({ ...filters, minPrice: '', maxPrice: '' });
                }}
                className="hover:text-emerald-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 font-medium px-2.5 py-1 rounded-full border border-amber-100">
              "{search}"
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="hover:text-amber-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Keywords Search */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Keyword Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search within results..."
            value={search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          {search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* PRICE RANGE FILTER SECTION */}
      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider mb-3"
        >
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Price Range ($)
          </span>
          {expandedSections.price ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {expandedSections.price && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRICE_RANGES.map((preset) => {
                const active = isPresetActive(preset);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPresetPrice(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition border ${
                      active
                        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Inputs */}
            <form onSubmit={handlePriceApply} className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[10px] text-slate-400 mb-1 font-medium">Min Price ($)</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={localMin}
                      onChange={(e) => setLocalMin(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 mb-1 font-medium">Max Price ($)</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Any"
                      value={localMax}
                      onChange={(e) => setLocalMax(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-lg transition"
              >
                Apply Price
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider mb-3"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Category
          </span>
          {expandedSections.category ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {expandedSections.category && (
          <div className="pt-1">
            <CategoryFilter
              selectedCategory={category}
              onSelectCategory={(cat) => onFilterChange({ ...filters, category: cat })}
              variant="list"
            />
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider mb-3"
        >
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            Brand
          </span>
          {expandedSections.brand ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {expandedSections.brand && (
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, brand: '' })}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition flex items-center justify-between ${
                !brand
                  ? 'bg-indigo-50 font-bold text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Brands</span>
              {!brand && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
            {brandsList.map((b) => {
              const selected = brand === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, brand: b })}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition flex items-center justify-between ${
                    selected
                      ? 'bg-indigo-50 font-bold text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{b}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container */}
      <aside className="hidden md:block bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit sticky top-24">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 z-10 animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Filter Products</h3>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {SidebarContent}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl"
              >
                Show Results {totalResults !== null ? `(${totalResults})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
