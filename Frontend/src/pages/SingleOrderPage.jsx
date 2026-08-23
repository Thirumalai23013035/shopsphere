import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  ChevronLeft, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShieldCheck,
  Calendar,
  ExternalLink,
  FileText
} from 'lucide-react';

const SingleOrderPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSingleOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/order/${id}`);
        setOrder(res.data.order || res.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.message || 'Order details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSingleOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500">Fetching order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto my-12 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{error || 'We could not retrieve information for this order.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const items = order.items || order.item || [];
  const status = order.orderStatus || order.status || 'Placed';
  const paymentStatus = order.paymentStatus || (order.isPaid ? 'Paid' : 'Pending');

  // Status step calculation
  const statusSteps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = Math.max(0, statusSteps.findIndex((s) => s.toLowerCase() === status.toLowerCase()));

  const subtotal = Number(order.subtotal || order.totalAmount || order.totalPrice || 0);
  const deliveryCharge = Number(order.deliveryCharge || (subtotal >= 500 ? 0 : 50));
  const grandTotal = Number(order.totalPrice || order.totalAmount || (subtotal + deliveryCharge));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to My Orders
        </Link>
        <span className="text-[11px] font-semibold text-slate-400">Order ID: #{order._id}</span>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-8">
        {/* Header Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" /> Official Order Summary
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">#{order._id}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              }) : 'N/A'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3.5 py-1.5 rounded-full font-bold text-xs border flex items-center gap-1.5 ${
              status.toLowerCase() === 'delivered'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              <Truck className="w-3.5 h-3.5" />
              Status: {status}
            </span>

            <span className={`px-3.5 py-1.5 rounded-full font-bold text-xs border flex items-center gap-1.5 ${
              paymentStatus.toLowerCase() === 'paid' || paymentStatus.toLowerCase() === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Payment: {paymentStatus}
            </span>
          </div>
        </div>

        {/* Order Progress Tracker */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Fulfillment Status</h2>
          <div className="grid grid-cols-4 gap-2 relative">
            {statusSteps.map((stepName, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={stepName} className="flex flex-col items-center text-center space-y-2 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[11px] font-bold ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping & Payment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Info */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" /> Shipping Destination
            </span>
            <p className="text-xs text-slate-800 font-medium leading-relaxed pt-1">
              {order.shippingAddress || 'Standard Shipping Address'}
            </p>
          </div>

          {/* Payment Info */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Payment & Billing
            </span>
            <div className="text-xs text-slate-800 font-medium space-y-1 pt-1">
              <p>Method: <span className="font-bold text-slate-900">{order.paymentMethod || 'Cash on Delivery'}</span></p>
              <p>Payment Status: <span className="font-bold text-emerald-600">{paymentStatus}</span></p>
            </div>
          </div>
        </div>

        {/* Purchased Items Table */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" /> Order Items ({items.length})
          </h2>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {items.map((item, index) => {
              const product = item.productId && typeof item.productId === 'object' ? item.productId : (item.product || item);
              const productId = product._id || item.productId || item._id;
              const name = product.name || item.name || 'Product';
              const price = Number(item.price || product.price || 0);
              const qty = Number(item.quantity || 1);

              return (
                <div key={index} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-4">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <Link
                        to={`/products/${productId}`}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition line-clamp-1 flex items-center gap-1 group"
                      >
                        {name}
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                      </Link>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        ${price.toFixed(2)} × {qty}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-slate-900 shrink-0">
                    ${(price * qty).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery & Shipping</span>
            <span className="font-bold text-slate-900">
              {deliveryCharge === 0 ? 'FREE' : `$${deliveryCharge.toFixed(2)}`}
            </span>
          </div>
          <div className="pt-3 border-t border-slate-200/80 flex justify-between items-center text-base font-extrabold text-slate-900">
            <span>Total Amount Paid</span>
            <span className="text-xl text-indigo-600">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleOrderPage;
