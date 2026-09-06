import React from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, QrCode, ArrowRight, ShieldCheck, Zap,
  CheckCircle, Layers, TrendingUp, Sparkles, Smartphone, Play, Check, Sliders
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Print Shop Automation Software for India</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Outfit'] leading-[1.08] max-w-4xl mx-auto text-white">
            Automate <span className="gradient-text">QR print orders</span> from customer upload to printer.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate counter queues and accidental misprints. Bring document intake, structured customer print settings, and automatic printer queues into one unified merchant workspace.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/merchant"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Printer className="w-5 h-5" />
              <span>Launch Merchant Workspace</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/portal/catalyst-print-hub"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-base border border-slate-700/80 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <QrCode className="w-5 h-5 text-cyan-400" />
              <span>Try Customer QR Portal</span>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80 pt-8 text-left">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">10x</span>
              <p className="text-xs text-slate-400 mt-1">Faster Counter Flow</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">0%</span>
              <p className="text-xs text-slate-400 mt-1">Platform Commission</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">1-Click</span>
              <p className="text-xs text-slate-400 mt-1">Printer Spool Release</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">100%</span>
              <p className="text-xs text-slate-400 mt-1">Direct Merchant UPI / Cash</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4 Core Pillars Feature Grid matching Print Catalyst */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
              Why Print Catalyst?
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Complete software engineered for Indian print shops & photocopy centers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Structured QR Document Intake</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Print Catalyst brings customer files, print preferences, and printer delivery into one traceable merchant workflow. Designed for print shops, photocopy centres, stationery stores, and document-service counters.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-cyan-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Structured Print Settings</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Customers configure copies, page selection, colour vs monochrome, duplex back-to-back, paper size, and finishing as structured choices right on their phones.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Pre-flight Document Studio</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Inspect multi-page PDFs, rotate sideways pages (90°/180°), preview monochrome grayscale, and verify font embedding before dispatching to physical printer queues.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Compatible Printer Fulfilment</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connects silently to Canon, HP, Epson, Brother, Konica Minolta, and Ricoh printers via the Desktop Agent daemon for Windows, Mac, and Linux.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive Workflow Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">How It Works</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              From Customer Upload to Finished Physical Print
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow">1</span>
              <h4 className="text-base font-bold text-white">1. Scan Counter QR</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Walk-in customer scans your shop's acrylic QR standee with any smartphone camera.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow">2</span>
              <h4 className="text-base font-bold text-white">2. Upload & Configure</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customer selects Color vs B&W, Single vs Duplex, Copies, Paper Size, GSM and Finishing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow">3</span>
              <h4 className="text-base font-bold text-white">3. Direct Payment & Token</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customer pays directly to your shop UPI or counter cash, and receives an instant 3-digit Pickup Token.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow">4</span>
              <h4 className="text-base font-bold text-white">4. Silent Spool & Print</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Print Catalyst Desktop Agent dispatches the job to the correct printer queue silently. Ready in seconds!
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Merchant CTA Banner */}
      <section className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl font-extrabold text-white font-['Outfit']">Ready to automate your print counter?</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Set up your shop profile, generate your counter QR standee, and connect your printers in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/merchant"
              className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Open Merchant Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
