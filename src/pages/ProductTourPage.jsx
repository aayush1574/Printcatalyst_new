import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, QrCode, MessageSquare, ArrowRight, ShieldCheck, Zap, Layers, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProductTourPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-12">
        
        {/* Hero Section */}
        <header className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Print Support · Print Shop Automation Software India
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight">
            Print shop automation software that connects every order step
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl">
            Automate document intake, settings, pricing, payment release and printer queues with software designed for Indian print businesses.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/merchant"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/portal/catalyst-print-hub"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Experience Customer Self-Intake</span>
            </Link>
          </div>
        </header>

        {/* 4 Feature Deep Dives matching exact content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-7 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h2 className="text-lg font-bold text-white">Structured document intake</h2>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Print Support brings customer files, print preferences, prices, payment state and printer delivery into one traceable merchant workflow. It is designed for print shops, photocopy centres, stationery stores and document-service counters that want to reduce repetitive handling while retaining operational control.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h2 className="text-lg font-bold text-white">Merchant-controlled print settings</h2>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Customers can submit supported documents through a permanent shop QR or connected WhatsApp flow. Copies, page selection, colour, duplex, paper and orientation are captured as structured choices instead of being left in an ambiguous chat message or handwritten note.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h2 className="text-lg font-bold text-white">Transparent pricing and payment state</h2>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              The merchant defines available services, paper formats, pricing and release policy. Confirmed work is checked against configured printer capabilities and current health before the local desktop agent sends an explicit ticket to the operating-system print queue.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h2 className="text-lg font-bold text-white">Compatible printer fulfilment</h2>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Print failures are handled conservatively. Work proven not delivered may be routed again, while output attempted by a printer is held for physical verification to reduce accidental duplicate printing.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 text-sm">
          <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-bold text-indigo-300">Can merchants keep manual print approval?</h3>
              <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                Yes. Structured intake and preparation can still end at a merchant-controlled release step. You can toggle between 1-click manual approval or instant auto-print on UPI verification.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-indigo-300">Does Print Support work with existing printers?</h3>
              <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                The desktop agent works with compatible installed printer queues (Canon, HP, Epson, Brother, Ricoh, Konica Minolta) after the required paper, colour, duplex and tray settings are verified.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
