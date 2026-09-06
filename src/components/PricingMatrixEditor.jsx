import React, { useState } from 'react';
import { IndianRupee, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function PricingMatrixEditor({ initialPricing, onSave }) {
  const [pricing, setPricing] = useState(initialPricing || {});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRateChange = (paperSize, field, val) => {
    setPricing((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [paperSize]: {
          ...(prev.rates?.[paperSize] || {}),
          [field]: parseFloat(val) || 0
        }
      }
    }));
  };

  const handlePaperTypeExtra = (key, val) => {
    setPricing((prev) => ({
      ...prev,
      paperTypes: {
        ...prev.paperTypes,
        [key]: {
          ...prev.paperTypes[key],
          extraPerPage: parseFloat(val) || 0
        }
      }
    }));
  };

  const handleFinishingPrice = (key, val) => {
    setPricing((prev) => ({
      ...prev,
      finishing: {
        ...prev.finishing,
        [key]: {
          ...prev.finishing[key],
          price: parseFloat(val) || 0
        }
      }
    }));
  };

  const handleSave = async () => {
    await onSave(pricing);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Rate Matrix per Paper Size */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              Standard Page Print Rates
            </h3>
            <p className="text-slate-400 text-[11px]">Set exact per-page price for Black & White and Full Color</p>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            Rates in INR (₹)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Paper Size</th>
                <th className="py-2.5 px-3">B&W Single</th>
                <th className="py-2.5 px-3">B&W Duplex (per side)</th>
                <th className="py-2.5 px-3">Color Single</th>
                <th className="py-2.5 px-3">Color Duplex (per side)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {['A4', 'A3', 'Legal', 'Photo_4x6'].map((size) => {
                const r = pricing.rates?.[size] || {};
                return (
                  <tr key={size} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 text-white font-bold">{size.replace('_', ' ')}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          step="0.25"
                          value={r.monoSingle !== undefined ? r.monoSingle : ''}
                          onChange={(e) => handleRateChange(size, 'monoSingle', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          step="0.25"
                          value={r.monoDuplex !== undefined ? r.monoDuplex : ''}
                          onChange={(e) => handleRateChange(size, 'monoDuplex', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          value={r.colorSingle !== undefined ? r.colorSingle : ''}
                          onChange={(e) => handleRateChange(size, 'colorSingle', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-amber-300 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          value={r.colorDuplex !== undefined ? r.colorDuplex : ''}
                          onChange={(e) => handleRateChange(size, 'colorDuplex', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-amber-300 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Media Types & Finishing Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Media Paper Surcharges */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Paper GSM Quality Extra Surcharge
          </h4>
          <div className="space-y-2.5">
            {Object.entries(pricing.paperTypes || {}).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">{val.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">+ ₹</span>
                  <input
                    type="number"
                    step="0.5"
                    value={val.extraPerPage}
                    onChange={(e) => handlePaperTypeExtra(key, e.target.value)}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-slate-500">/pg</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finishing & Binding Rates */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Finishing & Binding Rates
          </h4>
          <div className="space-y-2.5">
            {Object.entries(pricing.finishing || {}).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-300">{val.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">₹</span>
                  <input
                    type="number"
                    step="1"
                    value={val.price}
                    onChange={(e) => handleFinishingPrice(key, e.target.value)}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Volume Discount Slabs */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Automatic Bulk Page Volume Discounts
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(pricing.volumeDiscounts || []).map((d, i) => (
            <div key={i} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-center">
              <span className="text-indigo-400 font-bold block mb-1">{d.minPages} - {d.maxPages} Pages</span>
              <span className="text-lg font-black text-emerald-400">{d.discountPercent}% OFF</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        {savedSuccess ? (
          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Pricing rate matrix updated successfully!
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Customer self-portal & WhatsApp bot update immediately.</span>
        )}

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

    </div>
  );
}
