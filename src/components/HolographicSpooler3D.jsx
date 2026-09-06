import React, { useState, useRef, useEffect } from 'react';
import {
  Printer, QrCode, Smartphone, Cpu, CheckCircle2, Zap,
  Layers, Sliders, RefreshCw, FileText, Sparkles, Check, Play,
  Volume2, ShieldCheck, Activity, Terminal, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HolographicSpooler3D() {
  const containerRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 6, y: -6 });
  const [isHovered, setIsHovered] = useState(false);

  // Interactive Live Ticket Simulation State
  const [pages, setPages] = useState(24);
  const [colorMode, setColorMode] = useState('COLOR'); // MONO | COLOR
  const [duplex, setDuplex] = useState('DOUBLE'); // SINGLE | DOUBLE
  const [paperType, setPaperType] = useState('standard_75gsm');
  const [targetPrinter, setTargetPrinter] = useState('Canon IR C3530i Laser');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState('READY'); // READY | SCANNING | SPOOLING | PRINTED
  const [spoolProgress, setSpoolProgress] = useState(0);

  // Rate calculation
  const baseRate = colorMode === 'COLOR' ? 8 : (duplex === 'DOUBLE' ? 1.5 : 2);
  const calculatedTotal = (pages * baseRate).toFixed(2);

  // Handle 3D Tilt Physics
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * -18;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    setRotate({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 6, y: -6 });
  };

  // Run instant simulated print spool
  const triggerSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStatus('SCANNING');
    setSpoolProgress(15);

    // Audio synthesizer chirp
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}

    setTimeout(() => {
      setSimulationStatus('SPOOLING');
      setSpoolProgress(75);
    }, 700);

    setTimeout(() => {
      setSimulationStatus('PRINTED');
      setSpoolProgress(100);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 1500);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationStatus('READY');
      setSpoolProgress(0);
    }, 3200);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative max-w-5xl mx-auto perspective-2000 select-none py-6"
    >
      {/* 3D Isometric Card Deck Canvas */}
      <div
        className="preserve-3d transition-transform duration-200 ease-out grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
        }}
      >
        
        {/* Left Column: Interactive 3D Document Ticket Inspector (5 Cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 text-left space-y-5 border border-indigo-500/30 shadow-2xl relative overflow-hidden group transform lg:-rotate-y-3 lg:translate-z-10">
          
          {/* Subtle iridescent glare sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-cyan-400/10 pointer-events-none"></div>

          {/* Ticket Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white font-['Outfit'] flex items-center gap-1.5">
                  Live Ticket Inspector
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-400">Interactive Preflight Configurator</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              TOKEN: CAT-481
            </span>
          </div>

          {/* File Card with Scanner Beam */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 relative overflow-hidden">
            {simulationStatus === 'SCANNING' && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-0 animate-laser-scan shadow-[0_0_12px_#06b6d4]"></div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white truncate max-w-[200px]">Thesis_Final_Approved.pdf</span>
              <span className="text-cyan-400 font-mono font-bold text-xs">{pages} Pages</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono">14.8 MB</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">PDF/X-1a Verified</span>
            </div>
          </div>

          {/* Interactive Page Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Page Count</span>
              <span className="text-indigo-400 font-mono">{pages} pages</span>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Color & Duplex Interactive Switches */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Color Mode */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Color Matrix</span>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setColorMode('MONO')}
                  className={`py-1 rounded-lg transition-all ${
                    colorMode === 'MONO'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  B&W
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode('COLOR')}
                  className={`py-1 rounded-lg transition-all ${
                    colorMode === 'COLOR'
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  Color
                </button>
              </div>
            </div>

            {/* Duplex Mode */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duplexing</span>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setDuplex('SINGLE')}
                  className={`py-1 rounded-lg transition-all ${
                    duplex === 'SINGLE'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  1-Sided
                </button>
                <button
                  type="button"
                  onClick={() => setDuplex('DOUBLE')}
                  className={`py-1 rounded-lg transition-all ${
                    duplex === 'DOUBLE'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  2-Sided
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Quote Display */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Instant Shop Rate</span>
              <span className="text-xl font-black text-white font-mono">₹{calculatedTotal}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              0% Fee · Direct VPA
            </span>
          </div>

        </div>

        {/* Right Column: 3D Holographic Spooler Dispatcher Core (7 Cols) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 text-left space-y-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden transform lg:rotate-y-3 lg:translate-z-20">
          
          {/* Holographic Glowing Atmosphere */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none"></div>

          {/* Engine Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
                <Cpu className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-['Outfit']">
                  Print Support Spooler Engine v2.4
                </h3>
                <p className="text-xs text-cyan-300 font-medium">Automated Routing & Desktop Agent Bridge</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Bridge Online
            </span>
          </div>

          {/* Real-time Hardware Spooler Rack */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-cyan-400" />
              Connected Hardware Spoolers
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Printer 1: HP Mono */}
              <div
                onClick={() => setTargetPrinter('HP LaserJet Pro M404dn')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  targetPrinter.includes('HP')
                    ? 'bg-slate-900/95 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-102'
                    : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400">USB001</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <strong className="text-xs text-white block truncate">HP LaserJet Mono</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">A4 · Black & White</span>
              </div>

              {/* Printer 2: Canon IR Color (Active Default) */}
              <div
                onClick={() => setTargetPrinter('Canon IR C3530i Laser')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  targetPrinter.includes('Canon')
                    ? 'bg-slate-900/95 border-cyan-400 shadow-lg shadow-cyan-400/20 scale-102'
                    : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-cyan-300">LAN · 192.168.1.45</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <strong className="text-xs text-white block truncate">Canon IR Color</strong>
                <span className="text-[10px] text-cyan-300 mt-1 block font-semibold">Auto-Routing Target</span>
              </div>

              {/* Printer 3: Epson EcoTank */}
              <div
                onClick={() => setTargetPrinter('Epson EcoTank L805 Photo')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  targetPrinter.includes('Epson')
                    ? 'bg-slate-900/95 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-102'
                    : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400">USB002</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <strong className="text-xs text-white block truncate">Epson Photo L805</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">Glossy / 300 GSM</span>
              </div>

            </div>
          </div>

          {/* Active Job Spool Progress Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Spooler Status: <strong className="text-white font-mono">{simulationStatus}</strong>
              </span>
              <span className="text-cyan-400 font-mono font-bold text-xs">{spoolProgress}%</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
              <div
                className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_#06b6d4]"
                style={{ width: `${Math.max(spoolProgress, 6)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Target: <strong className="text-slate-200">{targetPrinter}</strong></span>
              <span className="text-emerald-400 font-semibold">Ready for Silent Spool</span>
            </div>
          </div>

          {/* Big Action Interactive Spool Trigger Button */}
          <button
            type="button"
            onClick={triggerSimulation}
            disabled={isSimulating}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
              isSimulating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 hover:scale-102 active:scale-98 border border-cyan-400/40'
            }`}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Simulating 0.4s Silent Spool Dispatch...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Test Live 0.4s Spool Dispatch ({pages} Pgs · ₹{calculatedTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}
