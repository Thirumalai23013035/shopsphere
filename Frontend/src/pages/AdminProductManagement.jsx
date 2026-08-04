import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Upload,
  Search,
  Tag,
  Boxes,
  Image as ImageIcon,
  Check,
  RefreshCw,
  ExternalLink,
  FileJson,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Table Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    brand: '',
    stock: '',
    imageFile: null,
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Bulk upload state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const BULK_SAMPLE = JSON.stringify([
    { name: 'Product 1', description: 'Desc 1', price: 99, category: 'Electronics', brand: 'Brand A', stock: 20 },
    { name: 'Product 2', description: 'Desc 2', price: 49, category: 'Fashion', brand: 'Brand B', stock: 15 }
  ], null, 2);

  const handleBulkUpload = async () => {
    setBulkSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setError('JSON must be a non-empty array of products.');
        return;
      }
      const res = await api.post('/products/seed', parsed);
      setSuccess(`✅ ${res.data?.products?.length ?? parsed.length} products added successfully!`);
      setBulkJson('');
      setBulkOpen(false);
      fetchProducts();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid JSON or upload failed.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/products');
      let items = [];
      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (res.data?.products && Array.isArray(res.data.products)) {
        items = res.data.products;
      }
      setProducts(items);
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setError('Failed to fetch product catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle file selection & preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    if (!formData.imageFile) {
      setImagePreview(url);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      brand: '',
      stock: '10',
      imageFile: null,
      imageUrl: '',
    });
    setImagePreview('');
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    const existingImg = prod.image || prod.imageURL || '';
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price !== undefined ? String(prod.price) : '',
      category: prod.category || 'Electronics',
      brand: prod.brand || '',
      stock: prod.stock !== undefined ? String(prod.stock) : '10',
      imageFile: null,
      imageUrl: existingImg,
    });
    setImagePreview(existingImg);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/products/delete/${id}`);
      setSuccess('Product deleted successfully.');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.response?.data?.message || 'Failed to delete product.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.price || !formData.category || !formData.description || !formData.brand.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);

      const formPayload = new FormData();
      formPayload.append('name', formData.name.trim());
      formPayload.append('description', formData.description.trim());
      formPayload.append('price', String(formData.price));
      formPayload.append('category', formData.category.trim());
      formPayload.append('brand', formData.brand.trim());
      formPayload.append('stock', String(formData.stock));

      if (formData.imageFile) {
        formPayload.append('image', formData.imageFile);
      } else if (formData.imageUrl) {
        formPayload.append('image', formData.imageUrl);
        formPayload.append('imageUrl', formData.imageUrl);
        formPayload.append('imageURL', formData.imageUrl);
      }

      if (editingProduct) {
        await api.put(`/products/update/${editingProduct._id}`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess(`"${formData.name}" updated successfully!`);
      } else {
        await api.post('/products/add', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess(`"${formData.name}" created and saved to catalog!`);
      }

      setModalOpen(false);
      fetchProducts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Submit product error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Products
  const categoriesList = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      (prod.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Admin Command Dashboard
        </Link>
        <span className="text-xs font-bold text-slate-400">Catalog Management</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" /> Inventory Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Product Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Add new inventory, update specifications, handle Cloudinary image uploads, or remove items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center gap-2 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button
            type="button"
            onClick={() => setBulkOpen((prev) => !prev)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center gap-2 transition active:scale-95 shrink-0"
          >
            <FileJson className="w-4 h-4" />
            Bulk Upload
            {bulkOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bulk JSON Upload Panel */}
      {bulkOpen && (
        <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-extrabold">Bulk Product Upload (JSON)</h2>
            </div>
            <button
              onClick={() => setBulkJson(BULK_SAMPLE)}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-lg transition"
            >
              Load Sample
            </button>
          </div>
          <p className="text-xs text-slate-400">Paste a JSON array of products. Each must have: <code className="text-indigo-300">name, description, price, category, brand, stock</code>.</p>
          <textarea
            rows={10}
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            placeholder={BULK_SAMPLE}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
          />
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => { setBulkOpen(false); setBulkJson(''); }}
              className="flex-1 py-2.5 border border-slate-600 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={bulkSubmitting || !bulkJson.trim()}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {bulkSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {bulkSubmitting ? 'Uploading...' : 'Upload All Products'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-600 focus:outline-none transition"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 pl-6">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                      <span className="font-semibold text-slate-500">Loading catalog items...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => {
                  const img = prod.image || prod.imageURL || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
                  const stockNum = Number(prod.stock || 0);

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/80 transition group">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <img
                          src={img}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <Link
                            to={`/product/${prod._id}`}
                            className="font-extrabold text-slate-900 hover:text-indigo-600 transition line-clamp-1 flex items-center gap-1"
                          >
                            <span>{prod.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                          </Link>
                          <span className="text-[10px] font-mono text-slate-400">ID: {prod._id}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px]">
                          <Tag className="w-3 h-3 text-indigo-500" />
                          {prod.category || 'General'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-600">{prod.brand || 'N/A'}</td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        ${Number(prod.price || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1 ${
                            stockNum === 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : stockNum < 10
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {stockNum === 0 ? 'Out of Stock' : `${stockNum} units`}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400">
                    No products matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price ($USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="199.99"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Electronics, Fashion, etc."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Sony, Apple, Nike..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Include technical specs, key features, dimensions, or usage details..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition"
                />
              </div>

              {/* Cloudinary Upload & Preview */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Product Image (Cloudinary File Upload or Web URL)
                </label>

                {imagePreview && (
                  <div className="relative w-full h-32 bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-bold rounded-md">
                      Live Image Preview
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600 shrink-0" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition"
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 font-extrabold text-center uppercase tracking-wider">
                    — OR PASTE IMAGE URL —
                  </div>

                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.imageUrl}
                    onChange={handleUrlChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Processing Upload...' : editingProduct ? 'Save Updates' : 'Add to Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
