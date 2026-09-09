import React, { useState, useEffect } from 'react';
import { X, Printer, Check, Plus, Trash2, Sliders, Cpu, Activity, Play, Download, Sparkles } from 'lucide-react';
import { API_BASE } from '../config';

export default function PrinterSettingsModal({ printers = [], initialPrinter, onSavePrinter, onDeletePrinter, onTestPrint, isOpen, onClose }) {
  const [selectedPrinter, setSelectedPrinter] = useState(printers[0] || null);
  const [isCreating, setIsCreating] = useState(false);
  const [testPrinting, setTestPrinting] = useState(false);
  const [testSuccess, setTestSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    type: 'MONO_LASER',
    connection: 'LOCAL_USB',
    supportsColor: false,
    supportsDuplex: true,
    isDefaultMono: false,
    isDefaultColor: false,
    trayCount: 1
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialPrinter === 'NEW') {
      handleStartCreate();
    } else if (initialPrinter && typeof initialPrinter === 'object') {
      handleSelect(initialPrinter);
    } else if (printers.length > 0 && !selectedPrinter) {
      handleSelect(printers[0]);
    } else if (printers.length === 0) {
      handleStartCreate();
    }
  }, [isOpen, initialPrinter]);

  if (!isOpen) return null;

  const handleSelect = (p) => {
    if (!p) return;
    setSelectedPrinter(p);
    setIsCreating(false);
    setForm({
      name: p.name || '',
      type: p.type || 'MONO_LASER',
      connection: p.connection || 'LOCAL_USB',
      supportsColor: p.supportsColor || false,
      supportsDuplex: p.supportsDuplex !== undefined ? p.supportsDuplex : true,
      isDefaultMono: p.isDefaultMono || false,
      isDefaultColor: p.isDefaultColor || false,
      trayCount: p.trayCount || 1
    });
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedPrinter(null);
    setForm({
      name: '',
      type: 'MONO_LASER',
      connection: 'LOCAL_USB',
      supportsColor: false,
      supportsDuplex: true,
      isDefaultMono: printers.length === 0,
      isDefaultColor: false,
      trayCount: 1
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Please enter a printer display name.');
      return;
    }
    if (isCreating) {
      await onSavePrinter({ ...form, id: 'prn_' + Date.now(), status: 'READY' });
    } else if (selectedPrinter) {
      await onSavePrinter({ ...selectedPrinter, ...form });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!selectedPrinter) return;
    if (window.confirm(`Are you sure you want to delete "${selectedPrinter.name}"?`)) {
      onDeletePrinter(selectedPrinter.id, selectedPrinter.name);
      setSelectedPrinter(null);
      setIsCreating(true);
      setForm({
        name: '',
        type: 'MONO_LASER',
        connection: 'LOCAL_USB',
        supportsColor: false,
        supportsDuplex: true,
        isDefaultMono: false,
        isDefaultColor: false,
        trayCount: 1
      });
    }
  };

  const triggerTestPrint = async (printerId) => {
    setTestPrinting(true);
    setTestSuccess('');
    try {
      await onTestPrint(printerId);
      setTestSuccess('Test print page dispatched to OS print spooler!');
      setTimeout(() => setTestSuccess(''), 3500);
    } finally {
      setTestPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Printer Queues & Auto-Routing</h3>
              <p className="text-xs text-slate-400">Configure connected local OS queues, network printers, and paper trays</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body 2 columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto">
          
          {/* Printers List Left */}
          <div className="md:col-span-5 space-y-3">
            {/* 1-Click Auto-Detect Notice */}
            <div className="p-3 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Detect Local Printers
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  1-Click Windows tool scans & links all PC printers instantly.
                </div>
              </div>
              <a
                href={`${API_BASE}/api/v1/agent/download-connector`}
                download
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-sm"
                title="Download 1-click installer"
              >
                <Download className="w-3 h-3" />
                <span>Auto-Detect</span>
              </a>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Installed Printers ({printers.length})</span>
              <button
                onClick={handleStartCreate}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom</span>
              </button>
            </div>

            <div className="space-y-2">
              {printers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPrinter?.id === p.id && !isCreating
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-tight">{p.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {p.connection} · {p.supportsColor ? 'Color + B&W' : 'Monochrome only'}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-400">
                    {p.isDefaultMono && <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Default B&W</span>}
                    {p.isDefaultColor && <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Default Color</span>}
                    {p.supportsDuplex && <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Auto Duplex</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form & Diagnostics Right */}
          <div className="md:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isCreating ? 'Add New Printer Queue' : `Configure ${selectedPrinter?.name || 'Printer'}`}
            </h4>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Printer Display Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Hewlett-Packard HP LaserJet M1005 or Canon IR3530"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Printer Technology</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="MONO_LASER">High-Speed Mono Laser</option>
                  <option value="MULTIFUNCTION_LASER">Multifunction Color Laser</option>
                  <option value="COLOR_INKJET_PHOTO">Color Inkjet / Photo Tank</option>
                  <option value="THERMAL_RECEIPT">Thermal Receipt / Label</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Port / Connection</label>
                <select
                  value={form.connection}
                  onChange={(e) => setForm({ ...form, connection: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOCAL_USB">Local USB / Spooler</option>
                  <option value="NETWORK_IP">Network LAN / WiFi IP</option>
                  <option value="SHARED_SMB">Windows Shared Printer (SMB)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={form.supportsColor}
                  onChange={(e) => setForm({ ...form, supportsColor: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <span>Supports Full Color Output</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={form.supportsDuplex}
                  onChange={(e) => setForm({ ...form, supportsDuplex: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <span>Supports Automatic Double-Sided (Duplex) Flipping</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isDefaultMono}
                  onChange={(e) => setForm({ ...form, isDefaultMono: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <span>Designate as primary route for Monochrome (B&W) jobs</span>
              </label>
            </div>

            {/* Test Print Action */}
            {selectedPrinter && !isCreating && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => triggerTestPrint(selectedPrinter.id)}
                    disabled={testPrinting}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{testPrinting ? 'Sending Test Page...' : 'Send Test Print'}</span>
                  </button>
                  {testSuccess && <p className="text-[11px] text-emerald-400 mt-1">{testSuccess}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                Save Printer Configuration
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
