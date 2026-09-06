import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export function GuidePage({ title, headline, content }) {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Print Support Guide</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">{title}</h1>
          <p className="text-base text-slate-400 leading-relaxed">{headline}</p>
        </header>
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 space-y-4 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalPage({ title, content }) {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-6">
        <h1 className="text-3xl font-bold text-white font-['Outfit']">{title}</h1>
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/api/v1/support/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-8 flex-1">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Contact Print Support</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">Get in Touch with Our Team</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Questions about onboarding, Desktop Agent setup, or custom multi-shop enterprise deployments? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-950 p-7 rounded-2xl border border-slate-800 space-y-6 text-xs sm:text-sm">
            <h2 className="font-bold text-white text-base">Direct Channels</h2>
            <div className="space-y-4 text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>support@printsupport.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span>+91 98765 43210 (WhatsApp Support)</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>Delhi NCR · Bangalore · Mumbai</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-7 rounded-2xl border border-slate-800 space-y-4">
            {submitted ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-white text-base">Enquiry Received!</h3>
                <p className="text-xs text-slate-400">Our customer success manager will contact you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Message / Question</label>
                  <textarea
                    rows={3}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Send Enquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
