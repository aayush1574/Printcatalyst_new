import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ArrowRight, Printer, ShieldCheck, Smartphone, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function QROrdersTourPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
        
        <header className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-cyan-900/40 shadow-2xl space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
            Print Support · QR Code Printing System
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
            Counter QR Standees for Walk-in Customer Self-Upload
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl">
            Give every walk-in customer their own digital counter terminal on their smartphone. No USB pen-drives, no computer sharing, no viruses.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/portal/printsupport-hub"
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Test Live Customer QR Portal</span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Permanent Shop QR</h3>
            <p className="text-slate-400 leading-relaxed">
              Print high-res acrylic standees for your physical front desk. Works on any iOS/Android camera without installing any apps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Direct UPI Checkout</h3>
            <p className="text-slate-400 leading-relaxed">
              Customers scan your shop UPI VPA and pay in 3 seconds. Dispatches directly to your local printer spool.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Safe & Virus Free</h3>
            <p className="text-slate-400 leading-relaxed">
              Zero pen-drive insertions on shop computers. Protects your shop PCs against malware and corrupted drives.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
