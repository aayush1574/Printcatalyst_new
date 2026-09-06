import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Heart, Mail, Phone, MapPin, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-['Outfit'] text-white">Print Catalyst</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The premier print shop automation software designed specifically for Indian Xerox centers, stationery stores, photocopy hubs, and high-volume document counters.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>support@printcatalyst.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+91 98765 43210 (WhatsApp Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>New Delhi · Bangalore · Mumbai · Hyderabad</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Product</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/print-shop-automation-software" className="hover:text-white transition-colors">Print Shop Automation</Link></li>
              <li><Link to="/qr-code-printing-system" className="hover:text-cyan-400 transition-colors">QR Code Printing System</Link></li>
              <li><Link to="/print-order-management-software" className="hover:text-white transition-colors">Print Order Management</Link></li>
              <li><Link to="/automatic-printer-routing" className="hover:text-white transition-colors">Automatic Printer Routing</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Solutions & Guides */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Solutions</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/guides/prevent-mixed-print-orders" className="hover:text-white transition-colors">Prevent Mixed Print Orders</Link></li>
              <li><Link to="/merchant" className="hover:text-indigo-400 font-semibold transition-colors">Merchant Dashboard</Link></li>
              <li><Link to="/portal/catalyst-print-hub" className="hover:text-cyan-400 transition-colors">Customer QR Portal</Link></li>
            </ul>
          </div>

          {/* Legal & Platform */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Company</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/admin" className="hover:text-amber-400 transition-colors">Super Admin Panel</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Sales & Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Cancellation & Refund</Link></li>
              <li><Link to="/shipping-delivery" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Print Catalyst (printcatalyst.in). Built for modern Indian print businesses.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All systems operational
            </span>
            <span>Made with 🇮🇳 for print entrepreneurs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
