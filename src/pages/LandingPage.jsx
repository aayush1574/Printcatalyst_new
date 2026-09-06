import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, QrCode, ArrowRight, ShieldCheck, Zap,
  CheckCircle, Layers, TrendingUp, Sparkles, Smartphone, Play, Check, Sliders,
  Cpu, FileCheck, CheckCircle2, RefreshCw, ChevronRight, Activity, Terminal
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AntigravityCanvas from '../components/AntigravityCanvas';
import HolographicSpooler3D from '../components/HolographicSpooler3D';
import Interactive3DCalculator from '../components/Interactive3DCalculator';

export default function LandingPage() {
  const [activeSimulationStep, setActiveSimulationStep] = useState(0);

  // Auto step through interactive flow simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSimulationStep((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      
      {/* 3D Antigravity Particle & Constellation Canvas */}
      <AntigravityCanvas />

      <Navbar />

      {/* Hero Section with 3D Spatial Hologram */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden z-10">
        
        {/* Ambient Neon Atmosphere Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/20 blur-[140px] rounded-full pointer-events-none animate-pulse-glow"></div>
        <div className="absolute top-1/3 left-10 w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Spatial Hologram Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-xl shadow-indigo-500/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Spatial Print Shop Automation Suite</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-['Outfit'] leading-[1.06] max-w-5xl mx-auto text-white">
            Automate <span className="gradient-text">QR Print Orders</span> directly to physical printer queues.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300/90 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate counter chaos and misprints. Customers scan your shop QR standee, configure paper & color settings, and send jobs silently to your Canon, HP, or Epson spoolers in seconds.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/merchant"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-base shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
            >
              <Printer className="w-5 h-5" />
              <span>Launch Merchant Workspace</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/portal/printsupport-hub"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card hover:border-cyan-500/40 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:scale-105 shadow-xl"
            >
              <QrCode className="w-5 h-5 text-cyan-400" />
              <span>Experience Customer Portal</span>
            </Link>
          </div>

          {/* 3D Holographic Interactive Spooler Deck */}
          <div className="mt-12 lg:mt-16">
            <HolographicSpooler3D />
          </div>

          {/* Social Proof Metric Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto border-t border-white/10 pt-8 text-left">
            <div className="p-4 rounded-2xl glass-card transform hover:-translate-y-1 transition-all">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">10x</span>
              <p className="text-xs text-slate-400 mt-1">Faster Counter Turnover</p>
            </div>
            <div className="p-4 rounded-2xl glass-card transform hover:-translate-y-1 transition-all">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">0%</span>
              <p className="text-xs text-slate-400 mt-1">Gateway & Platform Fees</p>
            </div>
            <div className="p-4 rounded-2xl glass-card transform hover:-translate-y-1 transition-all">
              <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">1-Click</span>
              <p className="text-xs text-slate-400 mt-1">Silent Spooler Release</p>
            </div>
            <div className="p-4 rounded-2xl glass-card transform hover:-translate-y-1 transition-all">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">100%</span>
              <p className="text-xs text-slate-400 mt-1">Direct Merchant UPI / Cash</p>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Print Flow Architecture */}
      <section className="py-20 relative bg-slate-950/60 border-y border-white/10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Architecture Flow</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit']">
              How Print Support Works in Your Shop
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Click any step to inspect the automated data pipeline between customer smartphone, merchant dashboard, and physical tray.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            
            {[
              {
                step: '01',
                title: 'Scan Counter Standee',
                desc: 'Walk-in customer scans your shop acrylic QR standee with any phone camera. No app download needed.',
                badge: 'Mobile Web Portal',
                activeColor: 'border-indigo-500 shadow-indigo-500/20'
              },
              {
                step: '02',
                title: 'Configure & Pay Direct',
                desc: 'Customer selects Color vs B&W, Duplex, Copies, Paper GSM and pays 100% directly to your Shop UPI.',
                badge: 'Direct UPI / Cash',
                activeColor: 'border-blue-500 shadow-blue-500/20'
              },
              {
                step: '03',
                title: 'Live Intelligent Queue',
                desc: 'Job pops onto Merchant Dashboard with pickup token, color tagging, and pre-flight validation.',
                badge: 'Real-time WebSocket',
                activeColor: 'border-purple-500 shadow-purple-500/20'
              },
              {
                step: '04',
                title: 'Silent Physical Print',
                desc: 'Desktop agent routes the job to the correct printer queue (Mono Laser or Color Multi-function).',
                badge: 'Native Agent Daemon',
                activeColor: 'border-emerald-500 shadow-emerald-500/20'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveSimulationStep(idx)}
                className={`cursor-pointer rounded-2xl p-6 glass-card transition-all text-left space-y-3 relative ${
                  activeSimulationStep === idx
                    ? `${item.activeColor} border-2 shadow-2xl -translate-y-2 bg-slate-900/90`
                    : 'hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black font-mono ${activeSimulationStep === idx ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {item.step}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* 4 Core Pillars 3D Feature Grid */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Built for Indian Print Shops</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Complete software suite tailored for high-volume document counters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-indigo-500/50 transition-all group hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Instant QR Counter Intake</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate high-resolution printable QR standees with your shop branding. Customers scan, upload multi-page documents, and receive unique 3-digit pickup tokens instantly.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-cyan-500/50 transition-all group hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-lg">
                <Sliders className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Granular Pricing & Paper Matrix</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Define exact per-page rates for A4, A3, Legal, Bond 85 GSM, Glossy Photo Paper, Spiral Binding, and Hard Binding with automatic tiered volume discounts.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-amber-500/50 transition-all group hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Pre-flight Document Studio</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Inspect multi-page PDFs, rotate sideways orientation, check font rendering, and preview B&W conversions before sending pages to physical print spools.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-emerald-500/50 transition-all group hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-lg">
                <Printer className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Cross-Brand Desktop Agent</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connects silently to Canon, HP, Epson, Brother, Konica Minolta, and Ricoh printers via the local Desktop Agent background daemon for Windows, Mac, and Linux.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive 3D ROI & Savings Simulator */}
      <Interactive3DCalculator />

      <Footer />
    </div>
  );
}
