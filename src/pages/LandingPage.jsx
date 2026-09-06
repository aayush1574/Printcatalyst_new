import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, QrCode, ArrowRight, ShieldCheck, Zap,
  CheckCircle, Layers, TrendingUp, Sparkles, Smartphone, Play, Check, Sliders,
  Cpu, FileCheck, CheckCircle2, RefreshCw, ChevronRight, Activity, Terminal
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSimulationStep, setActiveSimulationStep] = useState(0);
  const [simulatedPages, setSimulatedPages] = useState(120);
  const heroRef = useRef(null);

  // Handle 3D Mouse Parallax Effect
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // -10 to +10 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Auto step through interactive flow simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSimulationStep((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      {/* Hero Section with 3D Spatial Canvas */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative pt-12 pb-24 lg:pt-20 lg:pb-36 overflow-hidden bg-dot-grid"
      >
        {/* Ambient Neon Atmosphere Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/20 blur-[130px] rounded-full pointer-events-none animate-pulse-glow"></div>
        <div className="absolute top-1/3 left-10 w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Spatial Hologram Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg shadow-indigo-500/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Print Shop Automation Suite</span>
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
              to="/portal/catalyst-print-hub"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card hover:border-cyan-500/40 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:scale-105 shadow-xl"
            >
              <QrCode className="w-5 h-5 text-cyan-400" />
              <span>Experience Customer Portal</span>
            </Link>
          </div>

          {/* 3D Antigravity Floating Canvas */}
          <div className="mt-16 lg:mt-24 max-w-5xl mx-auto perspective-1000">
            <div
              className="preserve-3d transition-transform duration-300 ease-out grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
              style={{
                transform: `rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`
              }}
            >
              
              {/* Card 1: Customer Phone Intake (Left Tilt) */}
              <div className="glass-card rounded-2xl p-5 text-left space-y-4 animate-float-slow transform md:-rotate-y-6 md:translate-z-10 hover:border-indigo-500/50">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">1. Customer QR Intake</h4>
                      <p className="text-[10px] text-slate-400">Zero app install required</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300">Annual_Report.pdf</span>
                    <span className="text-indigo-400 font-mono font-bold">24 Pgs</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5 text-center">
                      <span className="text-slate-400 block text-[9px]">COLOR</span>
                      <strong className="text-white">Full Color</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5 text-center">
                      <span className="text-slate-400 block text-[9px]">DUPLEX</span>
                      <strong className="text-white">Double-Sided</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Token: <strong className="text-white font-mono">CAT-481</strong></span>
                  <span className="text-emerald-400 font-bold">Paid Direct UPI ₹48</span>
                </div>
              </div>

              {/* Card 2: Center Intelligent Routing Engine (Elevated) */}
              <div className="glass-card rounded-2xl p-6 text-left space-y-4 md:-translate-y-4 md:translate-z-20 border-indigo-500/40 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 left-0 animate-laser-scan pointer-events-none"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Catalyst Spool Engine</h3>
                      <p className="text-[10px] text-cyan-300 font-medium">Automatic Pre-flight & Dispatch</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Routing Target</span>
                    <span className="text-cyan-400 font-bold">Canon C3530 Laser</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full w-4/5 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>PDF Pre-flight OK</span>
                    <span>Ready for Release</span>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    0.4s Instant Spool Dispatch
                  </span>
                </div>
              </div>

              {/* Card 3: Connected Physical Printer Hub (Right Tilt) */}
              <div className="glass-card rounded-2xl p-5 text-left space-y-4 animate-float-reverse transform md:rotate-y-6 md:translate-z-10 hover:border-cyan-500/50">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">3. Physical Spooler</h4>
                      <p className="text-[10px] text-slate-400">Desktop Daemon Online</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">USB/LAN</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>HP LaserJet Pro (Mono)</span>
                    <span className="text-emerald-400 font-bold">IDLE · 95%</span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>Canon IR Advance (Color)</span>
                    <span className="text-indigo-400 font-bold">PRINTING</span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>Epson EcoTank (Photo)</span>
                    <span className="text-cyan-400 font-bold">ONLINE</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total Jobs Today</span>
                  <span className="text-white font-mono font-bold">148 Completed</span>
                </div>
              </div>

            </div>
          </div>

          {/* Social Proof Metric Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/10 pt-8 text-left">
            <div className="p-4 rounded-xl glass-card">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">10x</span>
              <p className="text-xs text-slate-400 mt-1">Faster Counter Turnover</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">0%</span>
              <p className="text-xs text-slate-400 mt-1">Gateway & Platform Fees</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">1-Click</span>
              <p className="text-xs text-slate-400 mt-1">Silent Spooler Release</p>
            </div>
            <div className="p-4 rounded-xl glass-card">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">100%</span>
              <p className="text-xs text-slate-400 mt-1">Direct Merchant UPI / Cash</p>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Print Flow Playground */}
      <section className="py-20 relative bg-slate-950/60 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Live Architecture Flow</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit']">
              How Print Catalyst Works in Your Shop
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

      {/* 4 Core Pillars Feature Grid */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Built for Indian Print Shops</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Complete software suite tailored for high-volume document counters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-indigo-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Instant QR Counter Intake</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate high-resolution printable QR standees with your shop branding. Customers scan, upload multi-page documents, and receive unique 3-digit pickup tokens instantly.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-cyan-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Granular Pricing & Paper Matrix</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Define exact per-page rates for A4, A3, Legal, Bond 85 GSM, Glossy Photo Paper, Spiral Binding, and Hard Binding with automatic tiered volume discounts.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-amber-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Pre-flight Document Studio</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Inspect multi-page PDFs, rotate sideways orientation, check font rendering, and preview B&W conversions before sending pages to physical print spools.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-emerald-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
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

      {/* Interactive Page Volume Calculator */}
      <section className="py-20 bg-slate-950/80 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              Calculate Your Daily Time & Revenue Savings
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              See how much counter time and misprint waste Print Catalyst saves your print shop every single day.
            </p>

            <div className="space-y-4 pt-4 max-w-md mx-auto text-left">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Daily Customer Print Orders:</span>
                <span className="text-indigo-400 font-mono text-base">{simulatedPages} Orders/day</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={simulatedPages}
                onChange={(e) => setSimulatedPages(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Counter Time Saved</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{(simulatedPages * 2.5 / 60).toFixed(1)} hrs/day</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Monthly Misprint Savings</span>
                <span className="text-2xl font-black text-indigo-400 font-mono">₹{(simulatedPages * 1.5 * 30).toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Customer Wait Time</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">&lt; 30 sec</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/merchant"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <span>Get Started with Print Catalyst</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
