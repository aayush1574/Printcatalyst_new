import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Printer, ArrowRight, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export function OrderManagementPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
        <header className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Print Catalyst · Print Order Management
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
            Centralize Walk-in, QR & WhatsApp Orders in One Feed
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl">
            Never lose track of a customer print file again. Real-time Kanban queues with single-click spool release and audit logs.
          </p>

          <div className="pt-4">
            <Link
              to="/merchant"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg flex items-center gap-2 inline-flex"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Merchant Order Feed</span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Real-time Audio Alerts</h3>
            <p className="text-slate-400">Pleasant synthetic audio chimes notify operators when a customer places an order via QR or WhatsApp.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Pre-flight Document Studio</h3>
            <p className="text-slate-400">Inspect pages, rotate orientations, preview grayscale monochrome, and exclude pages before firing the spooler.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Pickup Token Generation</h3>
            <p className="text-slate-400">Every customer receives a unique 3-digit token code (e.g. CAT-481) preventing mixed-up print handouts.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function PrinterRoutingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
        <header className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Print Catalyst · Automatic Printer Routing
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
            Intelligent Multi-Machine Print Job Routing
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl">
            Automatically dispatch Black & White high-speed jobs to your mono laser, color graphics to your inkjet/color laser, and photos to your dedicated photo printer.
          </p>

          <div className="pt-4">
            <Link
              to="/merchant"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg flex items-center gap-2 inline-flex"
            >
              <Printer className="w-4 h-4" />
              <span>Configure Routing Hub</span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Smart Capability Matching</h3>
            <p className="text-slate-400">Jobs are automatically matched to compatible paper trays (A4, A3, Legal) and duplex capabilities.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Failover & Held Queue</h3>
            <p className="text-slate-400">If a machine runs out of paper or experiences a jam, jobs are held for physical verification to avoid double-printing.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Local Desktop Agent</h3>
            <p className="text-slate-400">Lightweight daemon talks to native OS print queues and functions without lag even during brief internet interruptions.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
