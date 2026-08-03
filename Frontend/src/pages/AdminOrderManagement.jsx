import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ShoppingBag, AlertCircle, CheckCircle2, ChevronLeft, RefreshCw } from 'lucide-react';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/order/all');
      const items = res.data.order || res.data.orders || (Array.isArray(res.data) ? res.data : []);
      setOrders(items);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError('Failed to fetch orders list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setSuccess('');
      setError('');
      await api.patch(`/order/${orderId}/status`, { orderStatus: newStatus });
      setSuccess(`Order #${orderId.substring(0, 8)} status updated to ${newStatus}`);
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      setSuccess('');
      setError('');
      await api.patch(`/order/${orderId}/payment`, { paymentStatus: newPaymentStatus });
      setSuccess(`Order #${orderId.substring(0, 8)} payment status updated to ${newPaymentStatus}`);
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Admin Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Fulfillment</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review customer orders, modify shipping progress, and confirm payments
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">#{ord._id?.substring(0, 10)}</span>
                      <span className="text-[10px] text-slate-400">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">
                        {ord.userId?.name || ord.userName || 'Customer'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {ord.userId?.email || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      ${Number(ord.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.orderStatus || 'Placed'}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.paymentStatus || 'Pending'}
                        onChange={(e) => handlePaymentStatusChange(ord._id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/orders/${ord._id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderManagement;
