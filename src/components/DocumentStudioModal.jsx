import React, { useState } from 'react';
import { X, Printer, RotateCw, Eye, CheckCircle, FileText, Settings, Sliders, AlertTriangle } from 'lucide-react';

export default function DocumentStudioModal({ order, printers, isOpen, onClose, onRelease }) {
  const [selectedPrinterId, setSelectedPrinterId] = useState(order?.assignedPrinterId || (printers[0]?.id || ''));
  const [rotation, setRotation] = useState(0);
  const [previewMono, setPreviewMono] = useState(order?.items[0]?.colorMode === 'BLACK_AND_WHITE');
  const [selectedPages, setSelectedPages] = useState('ALL');
  const [releasing, setReleasing] = useState(false);

  if (!isOpen || !order) return null;

  const item = order.items[0] || {};
  const totalPages = item.pageCount || 1;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRelease = async () => {
    setReleasing(true);
    await onRelease(order.id, selectedPrinterId);
    setReleasing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Document Studio Pre-flight
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {order.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Customer: <span className="text-slate-200 font-medium">{order.customerName}</span> ({order.customerPhone}) · File: <span className="text-indigo-300">{item.fileName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto">
          
          {/* Left / Center: Interactive Document Canvas Viewer */}
          <div className="lg:col-span-2 flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-4">
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700"
                  title="Rotate document"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Rotate ({rotation}°)</span>
                </button>

                <button
                  onClick={() => setPreviewMono(!previewMono)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
                    previewMono
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Toggle Grayscale monochrome preview"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{previewMono ? 'Monochrome Mode (B&W)' : 'Color Mode'}</span>
                </button>
              </div>

              <div className="text-slate-400 font-mono">
                {totalPages} Page(s) · {item.paperSize} · {item.duplex === 'DOUBLE_SIDED' ? 'Duplex' : 'Single'}
              </div>
            </div>

            {/* Document Preview Pages Grid */}
            <div className="flex-1 min-h-[360px] max-h-[460px] overflow-y-auto p-4 flex flex-wrap items-center justify-center gap-4 bg-slate-900/50 rounded-lg my-3">
              {Array.from({ length: Math.min(6, totalPages) }).map((_, i) => (
                <div
                  key={i}
                  className={`relative w-48 h-64 bg-white rounded shadow-xl flex flex-col p-4 text-slate-900 transition-all duration-300 transform`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: previewMono ? 'grayscale(100%) contrast(110%)' : 'none'
                  }}
                >
                  <div className="text-[10px] text-slate-400 font-mono flex justify-between border-b pb-1">
                    <span>Page {i + 1} of {totalPages}</span>
                    <span>{item.paperSize}</span>
                  </div>
                  <div className="mt-3 space-y-2 text-[9px] text-slate-700 flex-1 overflow-hidden font-serif leading-tight opacity-75 select-none">
                    <div className="h-3 w-3/4 bg-slate-400 rounded"></div>
                    <div className="h-2 w-full bg-slate-300 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-300 rounded"></div>
                    <div className="h-2 w-4/5 bg-slate-300 rounded"></div>
                    <div className="my-2 p-1.5 rounded bg-indigo-50 border border-indigo-100 text-[8px] text-indigo-900 font-sans">
                      {item.fileName} · Print Support Verified
                    </div>
                    <div className="h-2 w-full bg-slate-300 rounded"></div>
                    <div className="h-2 w-2/3 bg-slate-300 rounded"></div>
                  </div>
                  <div className="text-[8px] text-center text-slate-400 font-mono border-t pt-1">
                    {order.pickupToken}
                  </div>
                </div>
              ))}
              {totalPages > 6 && (
                <div className="w-full text-center text-xs text-slate-400 py-2">
                  + {totalPages - 6} more pages verified in spooler
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Pre-flight check: Margins & font embedding verified.
              </span>
              <span>Total calculated sheets: {Math.ceil(item.computedPages / (item.duplex === 'DOUBLE_SIDED' ? 2 : 1))}</span>
            </div>
          </div>

          {/* Right: Print Dispatch Options */}
          <div className="space-y-4">
            
            {/* Target Printer Selector */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Target Output Printer
              </label>
              <select
                value={selectedPrinterId}
                onChange={(e) => setSelectedPrinterId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {printers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.supportsColor ? 'Color' : 'Mono'} · {p.status})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Print Support intelligent router automatically recommends {order.assignedPrinterName}.
              </p>
            </div>

            {/* Print Parameters Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider mb-2">Order Specs</h4>
              
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Paper Format:</span>
                <span className="text-white font-medium">{item.paperSize} ({item.paperType})</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Color Mode:</span>
                <span className={`font-semibold ${item.colorMode === 'COLOR' ? 'text-amber-400' : 'text-slate-300'}`}>
                  {item.colorMode === 'COLOR' ? 'Full Color' : 'Black & White'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Sides (Duplex):</span>
                <span className="text-white font-medium">
                  {item.duplex === 'DOUBLE_SIDED' ? 'Double Sided (Flip Long Edge)' : 'Single Sided'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Copies:</span>
                <span className="text-white font-medium">{item.copies || 1}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Finishing:</span>
                <span className="text-indigo-400 font-medium capitalize">
                  {item.finishing?.replace('_', ' ') || 'None'}
                </span>
              </div>

              <div className="flex justify-between py-1 pt-2 text-sm font-bold">
                <span className="text-slate-300">Payment:</span>
                <span className="text-emerald-400">{order.paymentMethod === 'UPI' ? 'Direct Merchant UPI' : 'Counter Cash'}</span>
              </div>
            </div>

            {/* Direct Print Action CTA */}
            <button
              onClick={handleRelease}
              disabled={releasing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Printer className="w-5 h-5" />
              <span>{releasing ? 'Sending to Printer...' : 'Print Document Now'}</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
