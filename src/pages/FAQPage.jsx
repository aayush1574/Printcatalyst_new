import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What is print shop management software?',
      a: 'It organizes customer uploads, pricing, payments, print queues and printer routing in one merchant workspace.'
    },
    {
      q: 'Can customers upload documents using a QR code?',
      a: 'Yes. Each merchant receives a permanent shop QR that opens a secure document upload and print configuration flow.'
    },
    {
      q: 'Does Print Catalyst work with existing printers?',
      a: 'Print Catalyst routes orders through a local desktop agent to compatible printers (Canon, HP, Epson, Brother, Ricoh, Konica Minolta) already installed on the merchant computer.'
    },
    {
      q: 'Can merchants keep manual print approval?',
      a: 'Yes. Structured intake and preparation can still end at a merchant-controlled release step before physical print output.'
    },
    {
      q: 'How does WhatsApp automation work?',
      a: 'Customers forward their PDFs or photos to your shop number. Print Catalyst WhatsApp bot inspects the document page count, calculates the quote based on your rate card, and creates the job in your dashboard queue automatically.'
    },
    {
      q: 'How do customers pay?',
      a: 'Customers can pay directly via any Indian UPI app (PhonePe, Google Pay, Paytm, BHIM) using your shop UPI VPA QR, or pay cash at your counter.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-8">
        <header className="text-center space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Print Catalyst · Knowledge Base
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-400">Everything you need to know about Print Catalyst automation</p>
        </header>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base"
              >
                <span>{faq.q}</span>
                {openIndex === i ? <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-900 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
