import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Features Bar */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Truck className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Express Delivery</h4>
              <p className="text-xs text-slate-300 mt-0.5">Fast shipping across regions</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Secure Payments</h4>
              <p className="text-xs text-slate-300 mt-0.5">Protected transaction gateway</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <RotateCcw className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">30-Day Returns</h4>
              <p className="text-xs text-slate-300 mt-0.5">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Headphones className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">24/7 Support</h4>
              <p className="text-xs text-slate-300 mt-0.5">Dedicated customer team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
              S
            </div>
            <span>ShopSphere</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your premium MERN-powered e-commerce destination. Discover curated products across electronics, fashion, and everyday essentials.
          </p>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Navigation</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products" className="text-slate-300 hover:text-white transition">Product Catalog</Link></li>
            <li><Link to="/cart" className="text-slate-300 hover:text-white transition">Shopping Cart</Link></li>
            <li><Link to="/wishlist" className="text-slate-300 hover:text-white transition">Saved Items</Link></li>
            <li><Link to="/orders" className="text-slate-300 hover:text-white transition">Track Orders</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Customer Service</h5>
          <ul className="space-y-2 text-xs">
            <li className="text-slate-300">Email: support@shopsphere.com</li>
            <li className="text-slate-300">Hours: Mon-Fri 9:00 - 18:00</li>
            <li className="text-slate-300">FAQ & Returns Guide</li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Backend Status</h5>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            Connected to ShopSphere Node.js Express & MongoDB REST API engine.
          </p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            REST API Operational
          </span>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ShopSphere Application. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
