import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Sparkles, CheckCircle, Bot, Zap, Smartphone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function WhatsAppTourPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
        
        <header className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-emerald-900/40 shadow-2xl space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
            Print Support · WhatsApp Printing Software
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
            Automate WhatsApp document print orders without chat chaos
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl">
            Convert incoming WhatsApp customer files into structured print jobs with instant automated pricing quotes, settings configuration, and direct printer spooling.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/merchant"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Configure WhatsApp Bot in Dashboard</span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Instant File Intake</h3>
            <p className="text-slate-400 leading-relaxed">
              Customers forward PDFs, Word docs, photos, or tickets directly to your shop WhatsApp number.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Automated Price Quotes</h3>
            <p className="text-slate-400 leading-relaxed">
              Bot inspects page counts and calculates exact total price based on your shop's active rate card.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Custom Q&A Assistant</h3>
            <p className="text-slate-400 leading-relaxed">
              Automatically answers repetitive customer queries like shop timings, location, and binding rates 24/7.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
