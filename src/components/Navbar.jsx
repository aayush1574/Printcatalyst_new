import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, ArrowRight, LayoutDashboard, QrCode, ShieldCheck, Menu, X, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { merchant, admin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 pt-3 sm:pt-4 px-3 sm:px-6 pointer-events-none transition-all">
      <nav className="max-w-7xl mx-auto glass-pill rounded-2xl px-4 sm:px-6 py-3 pointer-events-auto border border-white/10 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <div className="w-full h-full bg-[#0a0e17] rounded-[10px] flex items-center justify-center">
                <Printer className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold font-['Outfit'] tracking-tight text-white flex items-center gap-1.5">
                Print Support
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">Automated Print Shop Suite</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/print-shop-automation-software"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/print-shop-automation-software')
                  ? 'text-white bg-indigo-600/30 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Product
            </Link>

            <Link
              to="/qr-code-printing-system"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isCurrent('/qr-code-printing-system')
                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              QR System
            </Link>

            <Link
              to="/print-order-management-software"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/print-order-management-software')
                  ? 'text-white bg-indigo-600/30 border border-indigo-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Orders
            </Link>

            <Link
              to="/automatic-printer-routing"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/automatic-printer-routing')
                  ? 'text-white bg-indigo-600/30 border border-indigo-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Printer Routing
            </Link>


            <Link
              to="/faq"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/faq')
                  ? 'text-white bg-indigo-600/30 border border-indigo-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              FAQ
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/contact')
                  ? 'text-white bg-indigo-600/30 border border-indigo-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Contact
            </Link>

            <Link
              to="/admin"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                isCurrent('/admin')
                  ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
              title="Super Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700/60 transition-all hover:scale-105"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>{merchant ? 'Switch Shop' : 'Shop Login'}</span>
            </Link>

            <Link
              to="/merchant"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{merchant ? merchant.shopName : 'Shop Console'}</span>
              <ArrowRight className="w-3.5 h-3.5 hidden md:inline" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/merchant"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Console</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-1.5 lg:hidden animate-fade-in">
            <Link
              to="/print-shop-automation-software"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Product
            </Link>
            <Link
              to="/qr-code-printing-system"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:bg-cyan-950/30 transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              QR Order System
            </Link>
            <Link
              to="/print-order-management-software"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Order Management
            </Link>
            <Link
              to="/automatic-printer-routing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Printer Routing
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Contact
            </Link>

            <div className="my-2 border-t border-slate-800"></div>

            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-950/30 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Master Admin Portal
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-950/30 transition-colors flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-indigo-400" />
              Shop Owner Login / Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
