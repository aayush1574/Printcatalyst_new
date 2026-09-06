import React, { useState } from 'react';
import { X, Plus, Printer, User, FileText, Check } from 'lucide-react';

export default function ManualOrderModal({ printers, isOpen, onClose, onCreateOrder }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fileName, setFileName] = useState('Counter_Walkin_Doc.pdf');
  const [pageCount, setPageCount] = useState(10);
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('BLACK_AND_WHITE');
  const [duplex, setDuplex] = useState('SINGLE_SIDED');
  const [paperSize, setPaperSize] = useState('A4');
  const [paperType, setPaperType] = useState('standard_75gsm');
  const [finishing, setFinishing] = useState('none');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateOrder({
      customerName: customerName || 'Walk-in Counter Customer',
      customerPhone: customerPhone || '+91 99999 00000',
      source: 'COUNTER_WALKIN',
      paymentMethod,
      items: [
        {
          fileName: fileName || 'Counter_Document.pdf',
          fileSize: '1.5 MB',
          fileUrl: '/uploads/sample_counter.pdf',
          fileType: 'application/pdf',
          pageCount: parseInt(pageCount) || 1,
          copies: parseInt(copies) || 1,
          colorMode,
          duplex,
          paperSize,
          paperType,
          finishing,
          pageRange: 'ALL',
          orientation: 'PORTRAIT'
        }
      ]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">New Counter Walk-in Job</h3>
              <p className="text-xs text-slate-400">Quickly create and spool a job for walk-in counter customer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Document / Note Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Pages</label>
              <input
                type="number"
                min="1"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Copies</label>
              <input
                type="number"
                min="1"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Legal">Legal</option>
                <option value="Photo_4x6">Photo 4x6</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Color Mode</label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="BLACK_AND_WHITE">Black & White (B&W)</option>
                <option value="COLOR">Full Color</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Sides (Duplex)</label>
              <select
                value={duplex}
                onChange={(e) => setDuplex(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="SINGLE_SIDED">Single Sided</option>
                <option value="DOUBLE_SIDED">Double Sided (Back-to-Back)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Finishing</label>
              <select
                value={finishing}
                onChange={(e) => setFinishing(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="none">No Finishing</option>
                <option value="stapling">Corner Staple</option>
                <option value="spiral_binding">Spiral Binding</option>
                <option value="hard_binding">Hard Project Binding</option>
                <option value="lamination_a4">A4 Lamination</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="CASH">Cash at Counter</option>
                <option value="UPI">Direct Shop UPI</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Create Order & Queue to Spooler</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
