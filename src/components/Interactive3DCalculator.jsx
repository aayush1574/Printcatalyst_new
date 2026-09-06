import React, { useState } from 'react';
import {
  TrendingUp, Clock, IndianRupee, ShieldAlert, Sparkles,
  Zap, Layers, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Interactive3DCalculator() {
  const [dailyOrders, setDailyOrders] = useState(120);
  const [avgPages, setAvgPages] = useState(18);
  const [colorPercent, setColorPercent] = useState(30);

  // Computations
  const totalDailyPages = dailyOrders * avgPages;
  const monthlyOrders = dailyOrders * 26; // 26 working days
  const monthlyPages = totalDailyPages * 26;

  // Time saved: avg 2.5 minutes manual WhatsApp/counter handling saved per order
  const monthlyHoursSaved = Math.round((monthlyOrders * 2.5) / 60);

  // Misprint prevention: 4% average waste prevented
  const monoPages = Math.round(monthlyPages * (1 - colorPercent / 100));
  const colorPages = Math.round(monthlyPages * (colorPercent / 100));
  const monthlyGrossRevenue = monoPages * 2 + colorPages * 8;
  const wasteSavedPerMonth = Math.round(monthlyGrossRevenue * 0.045);

  return (
    <section className="py-24 relative overflow-hidden bg-slate-950/70 border-t border-white/10">
      
      {/* Background Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/15 to-purple-600/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/10">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive ROI & Waste Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight">
            Calculate your shop's <span className="gradient-text">monthly profit unlock</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            See how eliminating counter congestion, WhatsApp file confusion, and manual misprints translates to pure bottom-line profit.
          </p>
        </div>

        {/* 3D Isometric Calculator Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Sliders Console (7 Cols) */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
              <Zap className="w-5 h-5 text-indigo-400" />
              Your Shop Daily Profile
            </h3>

            {/* Slider 1: Daily Orders */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Daily Customer Print Orders</span>
                <span className="text-indigo-400 font-mono font-bold text-sm">{dailyOrders} orders/day</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={dailyOrders}
                onChange={(e) => setDailyOrders(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Small Xerox (20)</span>
                <span>Busy College Hub (250)</span>
                <span>Mega Commercial (500)</span>
              </div>
            </div>

            {/* Slider 2: Average Pages */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Average Pages per Order</span>
                <span className="text-cyan-400 font-mono font-bold text-sm">{avgPages} pages</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="2"
                value={avgPages}
                onChange={(e) => setAvgPages(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Short IDs / Forms (2)</span>
                <span>Project Reports (30)</span>
                <span>Theses / Manuals (100)</span>
              </div>
            </div>

            {/* Slider 3: Color Ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Color Print Share</span>
                <span className="text-purple-400 font-mono font-bold text-sm">{colorPercent}% Color</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={colorPercent}
                onChange={(e) => setColorPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Mostly Mono (0%)</span>
                <span>Balanced Mix (30%)</span>
                <span>High Color & Photo (80%)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs text-slate-300">
              <span>Estimated Monthly Output:</span>
              <strong className="text-white font-mono text-sm">{monthlyPages.toLocaleString('en-IN')} Pages</strong>
            </div>

          </div>

          {/* Results Floating 3D Telemetry Box (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Stat Card 1: Time Saved */}
            <div className="glass-card rounded-2xl p-6 border-indigo-500/30 hover:border-indigo-500/50 shadow-xl space-y-2 transform hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Counter Time Saved</span>
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {monthlyHoursSaved} <span className="text-base text-slate-400 font-sans font-normal">hrs/mo</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Equivalent to eliminating <strong className="text-indigo-300">{Math.round(monthlyHoursSaved / 8)} full work days</strong> of manual file clicking and counter sorting.
              </p>
            </div>

            {/* Stat Card 2: Waste Prevented */}
            <div className="glass-card rounded-2xl p-6 border-emerald-500/30 hover:border-emerald-500/50 shadow-xl space-y-2 transform hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Misprint Loss Prevented</span>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                ₹{wasteSavedPerMonth.toLocaleString('en-IN')} <span className="text-base text-slate-400 font-sans font-normal">/mo</span>
              </div>
              <p className="text-[11px] text-slate-400">
                100% preflight page validation stops wrong page ranges and duplex orientation mistakes.
              </p>
            </div>

            {/* Stat Card 3: Annual Bottom-Line Boost */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-tr from-indigo-950/60 to-cyan-950/60 border-cyan-500/40 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Net Annual Benefit</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ROI &gt; 1200%
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                ₹{(wasteSavedPerMonth * 12 + monthlyHoursSaved * 12 * 200).toLocaleString('en-IN')}
              </div>
              <Link
                to="/pricing"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-102"
              >
                <span>Choose Your Plan (Starts ₹999/mo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
