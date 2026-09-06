import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Printer, QrCode, MessageSquare, Layers } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
        
        <header className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Print Support · How Print Shop Automation Works
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
            How Print Support works from upload to printer
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl">
            See how QR and WhatsApp documents move through customer print settings, pricing, payment confirmation, printer routing and fulfilment.
          </p>
        </header>

        <div className="space-y-6 text-sm">
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">Step 01</span>
            <h2 className="text-xl font-bold text-white">1. Structured Document Intake</h2>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Print Support brings customer files, print preferences, prices, payment state and printer delivery into one traceable merchant workflow. It is designed for print shops, photocopy centres, stationery stores and document-service counters that want to reduce repetitive handling while retaining operational control.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">Step 02</span>
            <h2 className="text-xl font-bold text-white">2. Merchant-Controlled Print Settings</h2>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Customers can submit supported documents through a permanent shop QR or connected WhatsApp flow. Copies, page selection, colour, duplex, paper and orientation are captured as structured choices instead of being left in an ambiguous chat message or handwritten note.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">Step 03</span>
            <h2 className="text-xl font-bold text-white">3. Transparent Pricing and Payment State</h2>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              The merchant defines available services, paper formats, pricing and release policy. Confirmed work is checked against configured printer capabilities and current health before the local desktop agent sends an explicit ticket to the operating-system print queue.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">Step 04</span>
            <h2 className="text-xl font-bold text-white">4. Compatible Printer Fulfilment</h2>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Print failures are handled conservatively. Work proven not delivered may be routed again, while output attempted by a printer is held for physical verification to reduce accidental duplicate printing.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
