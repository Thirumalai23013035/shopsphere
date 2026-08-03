import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Package, Clock, ChevronRight, AlertCircle, ArrowRight } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/order/myorders');
        const items = res.data.order || res.data.orders || (Array.isArray(res.data) ? res.data : []);
        setOrders(items);
      } catch (err) {
        if (err.response?.status === 404) {
          setOrders([]);
        } else {
          setError('Failed to fetch your order history.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Package className="w-4 h-4" />
          Order History
        </div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track, review, or inspect your previous purchases
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-indigo-300 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    Order ID: #{order._id?.substring(0, 10)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                      order.orderStatus || 'Placed'
                    )}`}
                  >
                    {order.orderStatus || 'Placed'}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="block font-semibold">
                    Items: {order.item?.length || order.items?.length || 0}
                  </span>
                  <span className="block text-slate-400 text-[11px] truncate max-w-md">
                    Ship to: {order.shippingAddress || 'Standard Address'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ${Number(order.totalPrice || order.subtotal || 0).toFixed(2)}
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="p-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
                  >
                    Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Orders Placed Yet</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When you purchase items from ShopSphere, your order status and receipts will appear here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
