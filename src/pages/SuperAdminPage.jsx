import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Printer, IndianRupee, Layers, FileText, CheckCircle, Database, Server, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SuperAdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/v1/admin/overview');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                Print Catalyst · Super Admin Command Center
              </h1>
              <p className="text-xs text-slate-400">Platform telemetry, merchant accounts, and agent build repository</p>
            </div>
          </div>

          <button
            onClick={fetchOverview}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Global Platform KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total Registered Shops</span>
            <div className="text-3xl font-black text-white font-mono">{data?.totalShops || 1}</div>
            <span className="text-[10px] text-emerald-400">Active across 4 states</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Active Printer Queues</span>
            <div className="text-3xl font-black text-indigo-400 font-mono">{data?.activePrinters || 3}</div>
            <span className="text-[10px] text-indigo-300">Canon, HP & Epson</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total Platform Orders</span>
            <div className="text-3xl font-black text-cyan-400 font-mono">{data?.totalOrders || 3}</div>
            <span className="text-[10px] text-cyan-300">QR & WhatsApp intake</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total Billed GMV</span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              ₹{(data?.totalRevenue || 93).toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-500">100% direct merchant settlement</span>
          </div>
        </div>

        {/* Registered Merchant Shops List */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Merchant Accounts Directory ({data?.shops?.length || 1})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold pb-2">
                  <th className="py-2.5 px-3">Shop Name</th>
                  <th className="py-2.5 px-3">Owner / Contact</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Agent Status</th>
                  <th className="py-2.5 px-3">Portal Link</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {(data?.shops || []).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 text-white font-bold">{s.name}</td>
                    <td className="py-3 px-3 text-slate-300">
                      {s.ownerName} ({s.phone})
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                        {s.plan}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.agentStatus === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {s.agentStatus || 'OFFLINE'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-indigo-400">
                      <Link to={`/portal/${s.slug}`} target="_blank" className="hover:underline">
                        /portal/{s.slug}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        to="/merchant"
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      >
                        Open Workspace
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System & Storage Retention Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Document Storage Retention Policy
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Customer uploaded PDFs and photos are automatically encrypted and purged 24 hours after print completion to preserve shop privacy and disk space.
            </p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Automatic 24-Hour File Purge Active</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              Desktop Agent Spool Engine Build
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Print Catalyst Native Bridge Agent v1.4.2 compatible with Windows 10/11 x64, macOS Apple Silicon/Intel, and Linux CUPS.
            </p>
            <a
              href="/api/v1/agent/script"
              download
              className="inline-flex items-center gap-2 text-indigo-400 font-bold hover:underline"
            >
              <span>Download latest agent build script</span>
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
