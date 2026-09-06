import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer, Upload, FileText, CheckCircle2, QrCode,
  ShieldCheck, Smartphone, Layers, Check, Copy, ArrowRight, IndianRupee, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerPortalPage() {
  const { shopId = 'catalyst-print-hub' } = useParams();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Order configuration state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [files, setFiles] = useState([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Checkout & Submission State
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await fetch(`/api/v1/portal/shop/${shopId}`);
        const data = await res.json();
        setShopData(data.shop);
      } catch (e) {
        console.error('Failed to load shop info:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchShopInfo();
  }, [shopId]);

  // Handle file drop / upload
  const handleFileUpload = async (uploadedFiles) => {
    const formData = new FormData();
    for (let i = 0; i < uploadedFiles.length; i++) {
      formData.append('files', uploadedFiles[i]);
    }

    try {
      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.files) {
        const newItems = data.files.map((f, i) => ({
          id: 'item_' + Date.now() + '_' + i,
          fileName: f.fileName,
          fileSize: f.fileSize,
          fileUrl: f.fileUrl,
          fileType: f.fileType,
          pageCount: f.pageCount || 1,
          copies: 1,
          colorMode: 'BLACK_AND_WHITE',
          duplex: 'SINGLE_SIDED',
          paperSize: 'A4',
          paperType: 'standard_75gsm',
          pageRange: 'ALL',
          orientation: 'PORTRAIT',
          finishing: 'none'
        }));
        setFiles((prev) => [...prev, ...newItems]);
      }
    } catch (e) {
      console.error('File upload error:', e);
      alert('Error uploading document. Please try again.');
    }
  };

  const updateItem = (id, updates) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPages = files.reduce((acc, item) => acc + ((item.pageCount || 1) * (item.copies || 1)), 0);

  // Submit Order
  const handlePlaceOrder = async () => {
    if (files.length === 0) {
      alert('Please upload at least one document to print.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shopData?.id || 'shop_demo',
          customerName: customerName.trim() || 'Self-Service Customer',
          customerPhone: customerPhone.trim() || '',
          source: 'QR_PORTAL',
          paymentMethod: 'UPI',
          isUrgent,
          items: files
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        setPlacedOrder(data.order);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error('Order placement error:', e);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
          <span>Connecting to Print Shop Portal...</span>
        </div>
      </div>
    );
  }

  // Merchant direct UPI payment QR string
  const upiPayString = `upi://pay?pa=${shopData?.upiId || 'printcatalyst@okaxis'}&pn=${encodeURIComponent(shopData?.name || 'Print Shop')}&tn=${placedOrder?.id || 'PrintOrder'}`;
  const upiQrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiPayString)}&margin=1`;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 font-sans pb-16">
      
      {/* Top Banner Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight font-['Outfit']">
                {shopData?.name}
              </h1>
              <p className="text-[11px] text-slate-400">
                Self-Service Document Print Portal · {shopData?.address}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Printers Online
          </span>
        </div>
      </header>

      {/* Main Order Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* If Order Placed: Live Tracking Card */}
        {placedOrder ? (
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold text-white">Order Submitted Successfully!</h2>
              <p className="text-sm text-slate-400">
                Your print job has been placed in the shop queue.
              </p>
              <div className="inline-block px-5 py-2.5 bg-indigo-950/70 border-2 border-indigo-500/50 rounded-xl mt-3">
                <span className="text-xs text-indigo-300 block font-semibold uppercase tracking-wider">Your Pickup Token</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-widest">{placedOrder.pickupToken}</span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Job Status</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center mb-1 text-[11px]">✓</div>
                  <span className="text-emerald-400 font-semibold">Submitted</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center mb-1 text-[11px]">2</div>
                  <span className="text-slate-300">Direct Pay</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-1 text-[11px]">3</div>
                  <span className="text-slate-300">In Spool</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-500 font-bold flex items-center justify-center mb-1 text-[11px]">4</div>
                  <span className="text-slate-500">Printing</span>
                </div>
              </div>
            </div>

            {/* Direct Merchant Payment Box */}
            <div className="bg-slate-950 p-6 rounded-xl border border-indigo-500/40 flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Direct Payment to Merchant (0% Platform Fee)</span>
              </div>
              <h4 className="text-xl font-black text-white">Scan Merchant QR to Pay</h4>
              <div className="p-3.5 bg-white rounded-2xl shadow-2xl border-4 border-indigo-500">
                <img src={upiQrImgUrl} alt="Merchant Direct UPI QR" className="w-52 h-52 rounded-lg object-contain" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-300 font-semibold">
                  Pay directly to: <span className="text-white">{shopData?.name}</span>
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Open Google Pay, PhonePe, Paytm or BHIM UPI. Scan to pay the merchant directly.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <span>Merchant UPI ID: <strong className="text-indigo-300">{shopData?.upiId}</strong></span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shopData?.upiId);
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setPlacedOrder(null);
                  setFiles([]);
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                + Submit Another Print Order
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Documents */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  Upload Documents
                </h2>
                <span className="text-[11px] text-slate-400">PDF, Word, PNG, JPG (up to 100MB)</span>
              </div>

              {/* Drag Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all group"
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">Tap to upload files or drag and drop here</p>
                <p className="text-xs text-slate-500 mt-1">Files are securely processed and auto-spooled to shop printers</p>
              </div>

              {/* Uploaded File Config Cards */}
              {files.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Configured Documents ({files.length}) · Total {totalPages} Page(s)
                  </h3>

                  {files.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4.5 space-y-3.5 transition-all shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-900/40 text-indigo-400 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs">{item.fileName}</h4>
                            <p className="text-[11px] text-slate-400">{item.fileSize} · {item.pageCount} page(s)</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-slate-900"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Print Options Controls Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        
                        {/* Color Mode */}
                        <div>
                          <label className="text-slate-400 block mb-1 font-medium">Color Mode</label>
                          <select
                            value={item.colorMode}
                            onChange={(e) => updateItem(item.id, { colorMode: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="BLACK_AND_WHITE">Black & White (B&W)</option>
                            <option value="COLOR">Full Color</option>
                          </select>
                        </div>

                        {/* Duplex */}
                        <div>
                          <label className="text-slate-400 block mb-1 font-medium">Sides (Duplex)</label>
                          <select
                            value={item.duplex}
                            onChange={(e) => updateItem(item.id, { duplex: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="SINGLE_SIDED">Single Sided</option>
                            <option value="DOUBLE_SIDED">Double Sided (Back-to-Back)</option>
                          </select>
                        </div>

                        {/* Paper Size */}
                        <div>
                          <label className="text-slate-400 block mb-1 font-medium">Paper Size</label>
                          <select
                            value={item.paperSize}
                            onChange={(e) => updateItem(item.id, { paperSize: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="A4">A4 (Standard)</option>
                            <option value="A3">A3 (Large)</option>
                            <option value="Legal">Legal</option>
                            <option value="Photo_4x6">Photo (4x6")</option>
                          </select>
                        </div>

                        {/* Copies */}
                        <div>
                          <label className="text-slate-400 block mb-1 font-medium">Copies</label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={item.copies}
                            onChange={(e) => updateItem(item.id, { copies: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                      </div>

                      {/* Finishing & Paper GSM */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-900">
                        <div>
                          <label className="text-slate-400 block mb-1 font-medium">Paper GSM Quality</label>
                          <select
                            value={item.paperType}
                            onChange={(e) => updateItem(item.id, { paperType: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="standard_75gsm">Standard 75 GSM Paper</option>
                            <option value="bond_85gsm">Executive Bond 85 GSM</option>
                            <option value="glossy_180gsm">Glossy Photo 180 GSM</option>
                            <option value="cardstock_250gsm">Heavy Cardstock 250 GSM</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1 font-medium">Finishing / Binding</label>
                          <select
                            value={item.finishing}
                            onChange={(e) => updateItem(item.id, { finishing: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="none">No Finishing</option>
                            <option value="stapling">Corner Staple</option>
                            <option value="spiral_binding">Spiral Binding</option>
                            <option value="hard_binding">Hard Project Binding</option>
                            <option value="lamination_a4">A4 Lamination</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Print Order Button */}
            {files.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                >
                  <Printer className="w-5 h-5" />
                  <span>{submitting ? 'Placing Order in Queue...' : `Submit Print Order (${totalPages} Pages)`}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer Info */}
      <footer className="text-center text-xs text-slate-500 pt-8">
        Powered by <Link to="/" className="text-indigo-400 font-bold hover:underline">Print Catalyst</Link> · Automated Document Routing System
      </footer>

    </div>
  );
}
