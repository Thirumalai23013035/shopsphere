import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SortSelector, { sortProductsArray } from '../components/SortSelector';
import { SlidersHorizontal } from 'lucide-react';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state initialized from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Categories & Brands list for filters
  const categoriesList = ['Electronics', 'Fashion', 'Footwear', 'Home & Kitchen', 'Accessories', 'Beauty'];
  const brandsList = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Puma', 'Logitech'];

  useEffect(() => {
    // Sync state if URL changes externally
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setBrand(searchParams.get('brand') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'featured');
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (brand) params.append('brand', brand);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sort) params.append('sort', sort);
        params.append('page', page);

        let items = [];
        try {
          // If sorting is specified, query sort endpoint first for backend-level sorting
          const endpoint = sort && sort !== 'featured' ? `/products/sort?${params.toString()}` : `/products?${params.toString()}`;
          const res = await api.get(endpoint);
          const data = res.data;
          items = Array.isArray(data) ? data : (data.products || data.product || []);
        } catch (err) {
          // Fallback to basic endpoint if sort route fails
          const fallbackRes = await api.get(`/products?${params.toString()}`);
          const data = fallbackRes.data;
          items = Array.isArray(data) ? data : (data.products || data.product || []);
        }

        // Apply client-side sorting guarantee
        if (sort) {
          items = sortProductsArray(items, sort);
        }

        setProducts(items);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please check connection or try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, brand, minPrice, maxPrice, sort, page]);

  const handleFilterChange = (updatedFilters) => {
    const nextSearch = updatedFilters.search !== undefined ? updatedFilters.search : search;
    const nextCat = updatedFilters.category !== undefined ? updatedFilters.category : category;
    const nextBrand = updatedFilters.brand !== undefined ? updatedFilters.brand : brand;
    const nextMin = updatedFilters.minPrice !== undefined ? updatedFilters.minPrice : minPrice;
    const nextMax = updatedFilters.maxPrice !== undefined ? updatedFilters.maxPrice : maxPrice;

    setSearch(nextSearch);
    setCategory(nextCat);
    setBrand(nextBrand);
    setMinPrice(nextMin);
    setMaxPrice(nextMax);

    const newParams = {};
    if (nextSearch) newParams.search = nextSearch;
    if (nextCat) newParams.category = nextCat;
    if (nextBrand) newParams.brand = nextBrand;
    if (nextMin) newParams.minPrice = nextMin;
    if (nextMax) newParams.maxPrice = nextMax;
    if (sort && sort !== 'featured') newParams.sort = sort;

    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSort('featured');
    setPage(1);
    setSearchParams({});
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    const newParams = Object.fromEntries(searchParams.entries());
    if (newSort && newSort !== 'featured') {
      newParams.sort = newSort;
    } else {
      delete newParams.sort;
    }
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} product{products.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            Filters
          </button>

          {/* Sort Selector Component */}
          <SortSelector
            currentSort={sort}
            onSortChange={handleSortChange}
            variant="dropdown"
          />
        </div>
      </div>

      {/* Quick Sort Tabs Bar */}
      <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2 shrink-0 hidden sm:inline-block">
          Quick Sort:
        </span>
        <SortSelector
          currentSort={sort}
          onSortChange={handleSortChange}
          variant="pills"
          label=""
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filter Sidebar Component */}
        <FilterSidebar
          filters={{ search, category, brand, minPrice, maxPrice }}
          onFilterChange={handleFilterChange}
          onReset={handleClearFilters}
          categoriesList={categoriesList}
          brandsList={brandsList}
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          totalResults={products.length}
        />

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="w-full h-44 bg-slate-200 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center text-sm">
              {error}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <p className="text-3xl mb-2">🔍</p>
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your search query or clear applied filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded-xl"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListing;
