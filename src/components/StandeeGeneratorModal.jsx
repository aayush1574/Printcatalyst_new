import React, { useState, useRef } from 'react';
import { X, Printer, Download, QrCode, Sparkles, Check, Copy } from 'lucide-react';

export default function StandeeGeneratorModal({ shop, isOpen, onClose }) {
  const [standeeHeadline, setStandeeHeadline] = useState('Skip The Line & Print Direct');
  const [standeeSub, setStandeeSub] = useState('Scan QR on your phone · Upload PDF/Images · Pick up in 60 secs');
  const [accentColor, setAccentColor] = useState('#4361ee');
  const [copied, setCopied] = useState(false);
  const standeeRef = useRef(null);

  if (!isOpen || !shop) return null;

  const portalUrl = `${window.location.origin}/portal/${shop.slug}`;
  // High-res QR code URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(portalUrl)}&margin=1`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(`upi://pay?pa=${shop.upiId}&pn=${encodeURIComponent(shop.name)}`)}&margin=1`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Print Shop Counter QR Standee</h3>
              <p className="text-xs text-slate-400">Generate high-res acrylic counter standees for walk-in customer self-intake</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
          
          {/* Controls Left Column */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="font-semibold text-slate-300 uppercase tracking-wider block">Customize Standee</label>
              
              <div>
                <span className="text-slate-400 block mb-1">Headline Text</span>
                <input
                  type="text"
                  value={standeeHeadline}
                  onChange={(e) => setStandeeHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Sub-headline / Instructions</span>
                <textarea
                  rows={2}
                  value={standeeSub}
                  onChange={(e) => setStandeeSub(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Theme Accent Color</span>
                <div className="flex gap-2">
                  {['#4361ee', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccentColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        accentColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-slate-400 block font-semibold">Your Permanent Shop URL:</span>
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700 font-mono text-[11px] text-indigo-300 break-all select-all">
                <span className="truncate">{portalUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white ml-auto flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Print & Download Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Counter Standee (A4 / A5)</span>
              </button>
            </div>
          </div>

          {/* Standee Preview Graphic Column */}
          <div className="lg:col-span-7 flex justify-center items-center bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            
            {/* High-res Printable Canvas Template */}
            <div
              ref={standeeRef}
              className="w-full max-w-[340px] bg-white rounded-2xl shadow-2xl p-6 text-slate-900 flex flex-col items-center text-center relative overflow-hidden border-4"
              style={{ borderColor: accentColor }}
            >
              {/* Header Badge */}
              <div
                className="px-4 py-1.5 rounded-full text-white text-[11px] font-extrabold uppercase tracking-widest mb-3 shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                ⚡ Instant Self-Print Station
              </div>

              {/* Shop Name */}
              <h2 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                {shop.name}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{shop.address}</p>

              {/* Headline */}
              <div className="my-3 py-1 px-3 bg-slate-100 rounded-lg w-full">
                <p className="text-xs font-bold text-slate-800 leading-snug">{standeeHeadline}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{standeeSub}</p>
              </div>

              {/* High-res QR Code Box */}
              <div className="p-3 bg-white rounded-xl shadow-inner border-2 border-slate-200 my-2 relative">
                <img
                  src={qrUrl}
                  alt="Shop Order QR"
                  className="w-48 h-48 rounded-lg object-contain"
                />
                <div
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black text-white uppercase tracking-wider shadow"
                  style={{ backgroundColor: accentColor }}
                >
                  SCAN WITH CAMERA OR UPI
                </div>
              </div>

              {/* 3 Step Instruction Icons */}
              <div className="grid grid-cols-3 gap-2 w-full mt-4 text-[9px] font-semibold text-slate-700 border-t pt-3">
                <div className="flex flex-col items-center">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold mb-1">1</span>
                  <span>Scan QR code</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold mb-1">2</span>
                  <span>Upload & Config</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold mb-1">3</span>
                  <span>Collect Prints</span>
                </div>
              </div>

              {/* Footer WhatsApp info & UPI */}
              <div className="w-full mt-3 pt-2 border-t text-[10px] text-slate-500 flex justify-between items-center">
                <span>💬 WhatsApp: {shop.phone}</span>
                <span className="font-mono text-[9px] font-bold text-slate-700">UPI: {shop.upiId}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
