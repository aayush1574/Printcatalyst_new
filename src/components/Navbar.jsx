import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, ArrowRight, LayoutDashboard, QrCode, MessageSquare, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { merchant } = useAuth();

  const isCurrent = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Printer className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold font-['Outfit'] tracking-tight text-white flex items-center gap-1.5">
                Print Catalyst
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  India
                </span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">Print Shop Automation Platform</p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/print-shop-automation-software"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrent('/print-shop-automation-software')
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Product
            </Link>

            <Link
              to="/qr-code-printing-system"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isCurrent('/qr-code-printing-system')
                  ? 'text-cyan-400 bg-slate-800'
                  : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60'
              }`}
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              QR Orders
            </Link>

            <Link
              to="/print-order-management-software"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrent('/print-order-management-software')
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Order Management
            </Link>

            <Link
              to="/automatic-printer-routing"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrent('/automatic-printer-routing')
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Printer Routing
            </Link>

            <Link
              to="/how-it-works"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrent('/how-it-works')
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              How it works
            </Link>

            <Link
              to="/faq"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrent('/faq')
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              FAQ
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/portal/catalyst-print-hub"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/50 transition-colors"
              title="Test Customer Self-Service Portal"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              Customer Demo Portal
            </Link>

            <Link
              to="/merchant"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Merchant Dashboard</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
