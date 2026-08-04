import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SortSelector from '../components/SortSelector';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categoriesList = ['Electronics', 'Fashion', 'Footwear', 'Home & Kitchen', 'Accessories', 'Beauty'];
  const brandsList = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Puma', 'Logitech'];

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setBrand(searchParams.get('brand') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'featured');
    setPage(Number(searchParams.get('page')) || 1);
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
        if (sort && sort !== 'featured') params.append('sort', sort);
        params.append('page', page);
        params.append('limit', ITEMS_PER_PAGE);

        const res = await api.get(`/products?${params.toString()}`);
        const data = res.data;

        const items = data.products || data.product || (Array.isArray(data) ? data : []);
        setProducts(items);
        setTotalProducts(data.totalProducts ?? items.length);
        setTotalPages(data.totalPages ?? 1);
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
    setPage(1);

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
    setPage(1);
    const newParams = Object.fromEntries(searchParams.entries());
    if (newSort && newSort !== 'featured') {
      newParams.sort = newSort;
    } else {
      delete newParams.sort;
    }
    delete newParams.page;
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const newParams = Object.fromEntries(searchParams.entries());
    if (newPage > 1) {
      newParams.page = String(newPage);
    } else {
      delete newParams.page;
    }
    setSearchParams(newParams);
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            {loading
              ? 'Loading...'
              : `Showing ${products.length} of ${totalProducts} product${totalProducts === 1 ? '' : 's'} — Page ${page} of ${totalPages}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            Filters
          </button>

          <SortSelector currentSort={sort} onSortChange={handleSortChange} variant="dropdown" />
        </div>
      </div>

      {/* Quick Sort Pills */}
      <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2 shrink-0 hidden sm:inline-block">
          Quick Sort:
        </span>
        <SortSelector currentSort={sort} onSortChange={handleSortChange} variant="pills" label="" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FilterSidebar
          filters={{ search, category, brand, minPrice, maxPrice }}
          onFilterChange={handleFilterChange}
          onReset={handleClearFilters}
          categoriesList={categoriesList}
          brandsList={brandsList}
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          totalResults={totalProducts}
        />

        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, n) => (
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
                Try adjusting your search or clear applied filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded-xl"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>

              {page > 3 && (
                <>
                  <button onClick={() => handlePageChange(1)} className="w-8 h-8 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                    1
                  </button>
                  {page > 4 && <span className="text-slate-400 text-xs px-1">…</span>}
                </>
              )}

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 text-xs font-bold rounded-xl border transition ${
                    p === page
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="text-slate-400 text-xs px-1">…</span>}
                  <button onClick={() => handlePageChange(totalPages)} className="w-8 h-8 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListing;
