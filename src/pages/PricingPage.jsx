import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Printer, Sparkles, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
        
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Print Catalyst · Transparent Software Pricing
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
            Print shop software pricing plans
          </h1>
          <p className="text-base text-slate-400 leading-relaxed">
            Compare Print Catalyst plans for QR and WhatsApp orders, document tools, payment automation, staff access and connected printer workflows. Plans from ₹99/month.
          </p>
        </header>

        {/* 4 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          {/* Starter */}
          <div className="p-7 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter</span>
              <div className="text-4xl font-black text-white font-mono">₹99<span className="text-xs text-slate-500 font-sans">/mo</span></div>
              <p className="text-xs text-slate-400">For single-printer shops starting intake automation.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 1 Connected Printer</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Permanent Shop QR Portal</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to 200 monthly orders</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Desktop Agent Bridge</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Standard Email Support</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors block"
            >
              Choose Starter
            </Link>
          </div>

          {/* Growth */}
          <div className="p-7 rounded-2xl bg-indigo-950/60 border-2 border-indigo-500 space-y-5 flex flex-col justify-between relative shadow-xl">
            <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold text-[10px]">MOST POPULAR</span>
            <div className="space-y-3">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Growth</span>
              <div className="text-4xl font-black text-white font-mono">₹299<span className="text-xs text-slate-500 font-sans">/mo</span></div>
              <p className="text-xs text-slate-300">For busy photocopy centers and stationery counters.</p>
              <ul className="space-y-2.5 text-xs text-slate-200 border-t border-indigo-800/80 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to 3 Connected Printers</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> WhatsApp Document Intake Bot</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to 1,000 monthly orders</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Document Studio Pre-flight</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Intelligent Routing (B&W/Color)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Priority Chat Support</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center transition-colors block shadow-md shadow-indigo-600/30"
            >
              Choose Growth
            </Link>
          </div>

          {/* Pro */}
          <div className="p-7 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pro</span>
              <div className="text-4xl font-black text-white font-mono">₹799<span className="text-xs text-slate-500 font-sans">/mo</span></div>
              <p className="text-xs text-slate-400">For high-volume multi-machine print businesses.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to 10 Connected Printers</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Auto-Print Instant Release Mode</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to 5,000 monthly orders</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Bulk Quantity Discount Rules</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Financial Analytics & Export</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 24/7 Dedicated Support</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors block"
            >
              Choose Pro
            </Link>
          </div>

          {/* Scale */}
          <div className="p-7 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scale</span>
              <div className="text-4xl font-black text-white font-mono">₹1,499<span className="text-xs text-slate-500 font-sans">/mo</span></div>
              <p className="text-xs text-slate-400">For multi-branch chains and campus hubs.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited Connected Printers</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Multi-Branch Store Management</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to 25,000 monthly orders</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Custom Domain & Whitelabel</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> ERP & Billing POS Webhooks</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors block"
            >
              Choose Scale
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
