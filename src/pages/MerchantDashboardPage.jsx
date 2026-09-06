import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, LayoutDashboard, QrCode, Settings, Sliders,
  TrendingUp, Download, Plus, CheckCircle, Clock, AlertTriangle,
  Play, RefreshCw, Smartphone, Layers, Eye, FileText, Check, ShieldCheck, ChevronRight,
  Wifi, WifiOff, Sparkles, User, HelpCircle, Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { API_BASE } from '../config';
import DocumentStudioModal from '../components/DocumentStudioModal';
import StandeeGeneratorModal from '../components/StandeeGeneratorModal';
import PrinterSettingsModal from '../components/PrinterSettingsModal';
import ManualOrderModal from '../components/ManualOrderModal';

export default function MerchantDashboardPage() {
  const { merchant, setMerchant, token, logout } = useAuth();
  const { connected, latestEvent, playOrderChime } = useSocket();

  const [activeTab, setActiveTab] = useState('JOBS'); // JOBS | PRINTERS | STANDEE | AGENT | ANALYTICS | SETTINGS
  const [orders, setOrders] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [copiedPortalLink, setCopiedPortalLink] = useState(false);

  // Modals
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isStandeeOpen, setIsStandeeOpen] = useState(false);
  const [isPrinterSettingsOpen, setIsPrinterSettingsOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);

  // Load initial shop data
  const loadDashboardData = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const shopId = merchant?.id || 'shop_demo';

      const [ordersRes, printersRes, profileRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/jobs?shopId=${shopId}`, { headers }),
        fetch(`${API_BASE}/api/v1/printers/list?shopId=${shopId}`, { headers }),
        fetch(`${API_BASE}/api/v1/merchants/profile`, { headers })
      ]);

      const [ordersData, printersData, profileData] = await Promise.all([
        ordersRes.json(),
        printersRes.json(),
        profileRes.json()
      ]);

      setOrders(ordersData.orders || []);
      setPrinters(printersData || []);
      if (profileData && profileData.id) {
        setMerchant(profileData);
      }
      if (ordersData.orders?.length > 0) {
        setSelectedOrder(ordersData.orders[0]);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [merchant?.id, token]);

  // Handle live WebSocket updates
  useEffect(() => {
    if (!latestEvent) return;

    if (latestEvent.type === 'NEW_ORDER') {
      setOrders((prev) => [latestEvent.order, ...prev]);
      setSelectedOrder(latestEvent.order);
      playOrderChime();
    } else if (latestEvent.type === 'ORDER_UPDATED') {
      setOrders((prev) =>
        prev.map((o) => (o.id === latestEvent.order.id ? latestEvent.order : o))
      );
      if (selectedOrder?.id === latestEvent.order.id) {
        setSelectedOrder(latestEvent.order);
      }
    } else if (latestEvent.type === 'PRINTERS_UPDATED') {
      setPrinters(latestEvent.printers);
    } else if (latestEvent.type === 'AGENT_STATUS_CHANGE') {
      setMerchant((prev) => ({ ...prev, agentStatus: latestEvent.status }));
    }
  }, [latestEvent]);

  // Release Order to printer
  const handleReleaseOrder = async (orderId, targetPrinterId) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/jobs/release/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPrinterId })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        setSelectedOrder(data.order);
      }
    } catch (e) {
      console.error('Release error:', e);
    }
  };

  // Reject / Cancel Order
  const handleRejectOrder = async (orderId) => {
    if (!window.confirm('Cancel/Reject this print order?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/jobs/reject/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Merchant cancelled from dashboard' })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        setSelectedOrder(data.order);
      }
    } catch (e) {
      console.error('Reject error:', e);
    }
  };

  // Toggle Auto-Print
  const handleToggleAutoPrint = async () => {
    const updated = !merchant.autoPrintEnabled;
    setMerchant((prev) => ({ ...prev, autoPrintEnabled: updated }));
    await fetch(`${API_BASE}/api/v1/merchants/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoPrintEnabled: updated })
    });
  };

  // Save Printer
  const handleSavePrinter = async (printerData) => {
    if (printers.some((p) => p.id === printerData.id)) {
      await fetch(`${API_BASE}/api/v1/printers/${printerData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(printerData)
      });
    } else {
      await fetch(`${API_BASE}/api/v1/printers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(printerData)
      });
    }
    loadDashboardData();
  };

  // Delete Printer
  const handleDeletePrinter = async (printerId) => {
    await fetch(`${API_BASE}/api/v1/printers/${printerId}`, { method: 'DELETE' });
    loadDashboardData();
  };

  // Test Print
  const handleTestPrint = async (printerId) => {
    await fetch(`${API_BASE}/api/v1/test-print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ printerId, shopId: merchant?.id })
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'READY') return o.status === 'READY_TO_PRINT' || o.status === 'PENDING_APPROVAL';
    if (statusFilter === 'SPOOLING') return o.status === 'IN_SPOOL' || o.status === 'PRINTING';
    if (statusFilter === 'COMPLETED') return o.status === 'COMPLETED';
    if (statusFilter === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  const isAgentOnline = merchant?.agentStatus === 'ONLINE';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation & Status Bar */}
      <header className="bg-slate-950 border-b border-slate-800/90 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Brand & Shop Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight hidden sm:inline font-['Outfit']">
                Print Catalyst
              </span>
            </Link>

            <span className="text-slate-600 hidden sm:inline">|</span>

            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                {merchant?.name || 'Catalyst Print Hub'}
              </h2>
            </div>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            
            {/* Desktop Agent Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isAgentOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
              title={isAgentOnline ? 'Desktop Spooler Agent is connected and listening' : 'Desktop Agent offline. Click Agent tab to start'}
            >
              {isAgentOnline ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">Bridge Agent:</span>
              <span>{isAgentOnline ? 'ONLINE' : 'STANDBY'}</span>
            </div>

            {/* Auto Print Toggle */}
            <button
              onClick={handleToggleAutoPrint}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                merchant?.autoPrintEnabled
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
              title="Automatically dispatch jobs to default printer queue"
            >
              <span className={`w-2 h-2 rounded-full ${merchant?.autoPrintEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
              <span className="hidden sm:inline">Auto-Print:</span>
              <span>{merchant?.autoPrintEnabled ? 'ON' : 'MANUAL'}</span>
            </button>

            {/* Manual Counter Order Button */}
            <button
              onClick={() => setIsManualOrderOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Counter Order</span>
            </button>

            {/* Counter Standee Modal */}
            <button
              onClick={() => setIsStandeeOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 font-semibold flex items-center gap-1.5 border border-indigo-700/60 transition-colors"
              title="Generate printable acrylic shop QR standee"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">QR Standee</span>
            </button>

            {/* Customer Portal Link & Copy Button */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-indigo-300 font-mono hidden lg:inline">/portal/{merchant?.slug}</span>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/portal/${merchant?.slug || 'catalyst-print-hub'}`;
                  navigator.clipboard.writeText(url);
                  setCopiedPortalLink(true);
                  setTimeout(() => setCopiedPortalLink(false), 2000);
                }}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                title="Copy Shop Customer QR Portal URL"
              >
                {copiedPortalLink ? 'Copied!' : 'Copy Portal Link'}
              </button>
              <Link
                to={`/portal/${merchant?.slug || 'catalyst-print-hub'}`}
                target="_blank"
                className="p-1 text-slate-300 hover:text-white transition-colors"
                title="Open Customer Self-Service Portal"
              >
                <Eye className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Logout / Switch Shop */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Sign Out / Switch Shop"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Main 3-Panel Content Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-16 sm:w-60 bg-slate-950 border-r border-slate-800/90 flex flex-col justify-between py-4 flex-shrink-0">
          <div className="space-y-1 px-2 sm:px-3">
            
            <button
              onClick={() => setActiveTab('JOBS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'JOBS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Live Print Queue</span>
              {orders.filter(o => o.status === 'READY_TO_PRINT').length > 0 && (
                <span className="hidden sm:inline-block ml-auto px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px]">
                  {orders.filter(o => o.status === 'READY_TO_PRINT').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('PRINTERS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'PRINTERS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Printers & Routing</span>
              <span className="hidden sm:inline-block ml-auto text-[10px] text-slate-400 font-mono">
                {printers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('STANDEE')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'STANDEE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Shop QR Standee</span>
            </button>

            <button
              onClick={() => setActiveTab('AGENT')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'AGENT'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop Agent Bridge</span>
            </button>

            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'ANALYTICS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Print Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'SETTINGS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Business Profile & UPI</span>
            </button>

          </div>

          {/* Bottom Help / User Profile */}
          <div className="px-3 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 hidden sm:block space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="truncate font-medium">{merchant?.ownerName || 'Shop Owner'}</span>
              </div>
              <button
                onClick={logout}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Shop: {merchant?.name}
            </div>
          </div>
        </aside>

        {/* Center / Main Tab Area */}
        <main className="flex-1 flex overflow-hidden bg-slate-900/40">
          
          {/* TAB 1: LIVE JOBS KANBAN & ORDERS QUEUE */}
          {activeTab === 'JOBS' && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* Center Feed: Orders List */}
              <div className="flex-1 flex flex-col border-r border-slate-800/80 overflow-hidden">
                
                {/* Filter Bar */}
                <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
                  <div className="flex items-center gap-1 text-xs">
                    {[
                      { id: 'ALL', label: `All Orders (${orders.length})` },
                      { id: 'READY', label: `Ready (${orders.filter(o => o.status === 'READY_TO_PRINT' || o.status === 'PENDING_APPROVAL').length})` },
                      { id: 'SPOOLING', label: `In Spool (${orders.filter(o => o.status === 'IN_SPOOL' || o.status === 'PRINTING').length})` },
                      { id: 'COMPLETED', label: `Done (${orders.filter(o => o.status === 'COMPLETED').length})` },
                      { id: 'CANCELLED', label: `Rejected` }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          statusFilter === f.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={loadDashboardData}
                    className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-900"
                    title="Refresh orders feed"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Orders Scrollable List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 text-xs">
                      <Printer className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p>No orders found in this queue category.</p>
                      <button
                        onClick={() => setIsManualOrderOpen(true)}
                        className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                      >
                        + Create Counter Order
                      </button>
                    </div>
                  ) : (
                    filteredOrders.map((ord) => {
                      const isSelected = selectedOrder?.id === ord.id;
                      const item = ord.items[0] || {};

                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-black text-white text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                {ord.pickupToken}
                              </span>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                                  {ord.customerName}
                                  <span className="text-[10px] text-slate-400 font-normal">({ord.customerPhone})</span>
                                </h4>
                                <p className="text-[11px] text-indigo-300 truncate max-w-xs sm:max-w-md">
                                  {item.fileName} ({item.pageCount} pgs × {item.copies} cp)
                                </p>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                ord.status === 'READY_TO_PRINT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                                ord.status === 'IN_SPOOL' || ord.status === 'PRINTING' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                ord.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {ord.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Quick Specs Pill Row */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded font-medium ${item.colorMode === 'COLOR' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                                {item.colorMode === 'COLOR' ? 'Full Color' : 'B&W Mono'}
                              </span>
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">
                                {item.paperSize} · {item.duplex === 'DOUBLE_SIDED' ? 'Duplex' : 'Single'}
                              </span>
                              <span className="bg-slate-800/70 px-2 py-0.5 rounded text-slate-400">
                                {ord.paymentMethod === 'UPI' ? 'Direct UPI' : 'Counter Pay'}
                              </span>
                            </div>

                            {/* 1-Click Release Quick Trigger Button */}
                            {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReleaseOrder(ord.id);
                                }}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all"
                              >
                                <Play className="w-3 h-3" />
                                <span>Release Spool</span>
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Right Panel: Selected Order Detailed Inspector */}
              <div className="w-full lg:w-96 bg-slate-950 p-5 overflow-y-auto flex flex-col justify-between space-y-5 flex-shrink-0">
                {selectedOrder ? (
                  <div className="space-y-5 text-xs">
                    
                    {/* Header Details */}
                    <div className="border-b border-slate-800 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-indigo-400 font-bold">{selectedOrder.id}</span>
                        <span className="font-mono font-black text-sm bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-800">
                          {selectedOrder.pickupToken}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{selectedOrder.customerName}</h3>
                      <p className="text-slate-400 text-xs">{selectedOrder.customerPhone} · {new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                    </div>

                    {/* Pre-flight Inspector CTA */}
                    <button
                      onClick={() => setIsStudioOpen(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-indigo-400" />
                      <span>Open in Document Studio (Pre-flight)</span>
                    </button>

                    {/* Document Breakdown */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Print Specifications</h4>
                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">File Name:</span>
                          <span className="text-white font-medium truncate max-w-[170px]">{selectedOrder.items[0]?.fileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Paper Format:</span>
                          <span className="text-white font-medium">{selectedOrder.items[0]?.paperSize} ({selectedOrder.items[0]?.paperType})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Color Mode:</span>
                          <span className={`font-semibold ${selectedOrder.items[0]?.colorMode === 'COLOR' ? 'text-amber-400' : 'text-slate-300'}`}>
                            {selectedOrder.items[0]?.colorMode === 'COLOR' ? 'Full Color' : 'Black & White'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duplex / Sides:</span>
                          <span className="text-white font-medium">{selectedOrder.items[0]?.duplex === 'DOUBLE_SIDED' ? 'Double Sided' : 'Single Sided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Copies:</span>
                          <span className="text-white font-medium">{selectedOrder.items[0]?.copies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Finishing:</span>
                          <span className="text-indigo-400 font-medium capitalize">{selectedOrder.items[0]?.finishing?.replace('_', ' ') || 'None'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Assigned Printer:</span>
                          <span className="text-indigo-300 font-medium">{selectedOrder.assignedPrinterName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Traceability Timeline Event Logs */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Audit Logs</h4>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        {(selectedOrder.logs || []).map((l, i) => (
                          <div key={i} className="leading-snug">
                            <span className="text-slate-500">[{new Date(l.timestamp).toLocaleTimeString()}]</span> {l.text}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Dispatch Buttons */}
                    <div className="space-y-2 pt-2">
                      {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' ? (
                        <button
                          onClick={() => handleReleaseOrder(selectedOrder.id)}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Release to Printer Spooler</span>
                        </button>
                      ) : null}

                      {selectedOrder.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleRejectOrder(selectedOrder.id)}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 text-xs font-semibold transition-colors"
                        >
                          Cancel / Reject Order
                        </button>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    Select an order from the feed to view pre-flight specs and dispatch options.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PRINTERS & ROUTING HUB */}
          {activeTab === 'PRINTERS' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Printer className="w-5 h-5 text-indigo-400" />
                    Connected Printers & Smart Routing Hub
                  </h2>
                  <p className="text-slate-400 text-xs">Manage local queues, tray mapping and intelligent routing</p>
                </div>

                <button
                  onClick={() => setIsPrinterSettingsOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Configure / Add Printer</span>
                </button>
              </div>

              {/* Printers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {printers.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                        <Printer className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        {p.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{p.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.connection} · {p.type.replace('_', ' ')}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Color Output:</span>
                        <span className={p.supportsColor ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          {p.supportsColor ? 'Supported' : 'Monochrome only'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Auto Duplex:</span>
                        <span className="text-white font-medium">{p.supportsDuplex ? 'Enabled' : 'No'}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Toner / Ink Level:</span>
                        <span className="text-emerald-400 font-bold font-mono">{p.tonerBlack}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTestPrint(p.id)}
                      className="w-full mt-2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Send Diagnostics Test Print</span>
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: SHOP QR STANDEE */}
          {activeTab === 'STANDEE' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-400" />
                    Counter Acrylic QR Standee
                  </h2>
                  <p className="text-slate-400 text-xs">Print high-resolution QR standees for your physical counter</p>
                </div>

                <button
                  onClick={() => setIsStandeeOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Standee Designer & Print</span>
                </button>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                <p className="text-slate-300">
                  Click the button above to customize and print your permanent Shop QR standee template. Walk-in customers scan the QR to upload documents, configure settings, and send directly to the print queue.
                </p>
                <button
                  onClick={() => setIsStandeeOpen(true)}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30"
                >
                  Launch Standee Designer
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DESKTOP AGENT BRIDGE */}
          {activeTab === 'AGENT' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto text-xs">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Print Catalyst Desktop Bridge Agent
                </h2>
                <p className="text-slate-400 text-xs">Lightweight background spooler daemon for Windows, Mac & Linux</p>
              </div>

              {/* Status Banner */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isAgentOnline ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {isAgentOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Agent Status: <span className={isAgentOnline ? 'text-emerald-400' : 'text-amber-400'}>{merchant?.agentStatus}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Authentication Token: <span className="font-mono text-indigo-300">{merchant?.agentToken}</span></p>
                    </div>
                  </div>

                  <a
                    href={`${API_BASE}/api/v1/agent/script`}
                    download="printcatalyst-agent.js"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Agent Script</span>
                  </a>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs">Quick Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                    <li>Download or run the agent script on the computer connected to your printers.</li>
                    <li>In terminal, execute: <code className="bg-black/50 px-2 py-0.5 rounded text-indigo-300 font-mono">npm run agent</code> or <code className="bg-black/50 px-2 py-0.5 rounded text-indigo-300 font-mono">node server/agent-client/print-agent.js</code></li>
                    <li>The agent will automatically discover all installed printers and start silent spooling!</li>
                  </ol>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: ANALYTICS & REPORTS */}
          {activeTab === 'ANALYTICS' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto text-xs">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Print Performance & Page Volume Analytics
                </h2>
                <p className="text-slate-400 text-xs">Real-time order volume and paper usage statistics</p>
              </div>

              {/* Key Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium text-[11px]">Total Orders Processed</span>
                  <div className="text-2xl font-black text-white font-mono">{orders.length}</div>
                  <span className="text-[10px] text-emerald-400">100% fulfill rate</span>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium text-[11px]">Total Pages Printed</span>
                  <div className="text-2xl font-black text-indigo-400 font-mono">
                    {orders.reduce((sum, o) => sum + (o.items || []).reduce((acc, i) => acc + (i.computedPages || (i.pageCount * i.copies) || 0), 0), 0)}
                  </div>
                  <span className="text-[10px] text-indigo-300">Monochrome & Color</span>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium text-[11px]">Active Connected Printers</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">{printers.length}</div>
                  <span className="text-[10px] text-cyan-300">Auto-routed</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & PROFILE */}
          {activeTab === 'SETTINGS' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-3xl mx-auto text-xs">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  Business Profile & Direct UPI Settings
                </h2>
                <p className="text-slate-400 text-xs">Manage shop contact info, UPI ID for customer QR payments, and automation</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Shop Business Name</label>
                  <input
                    type="text"
                    value={merchant?.name || ''}
                    onChange={(e) => setMerchant({ ...merchant, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Owner Name</label>
                    <input
                      type="text"
                      value={merchant?.ownerName || ''}
                      onChange={(e) => setMerchant({ ...merchant, ownerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Contact Phone</label>
                    <input
                      type="text"
                      value={merchant?.phone || ''}
                      onChange={(e) => setMerchant({ ...merchant, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Direct UPI ID (for Customer QR Payments)</label>
                  <input
                    type="text"
                    value={merchant?.upiId || ''}
                    onChange={(e) => setMerchant({ ...merchant, upiId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Physical Shop Address</label>
                  <input
                    type="text"
                    value={merchant?.address || ''}
                    onChange={(e) => setMerchant({ ...merchant, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={async () => {
                    await fetch(`${API_BASE}/api/v1/merchants/profile`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(merchant)
                    });
                    alert('Shop profile updated successfully!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Profile Settings
                </button>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Modals */}
      <DocumentStudioModal
        order={selectedOrder}
        printers={printers}
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onRelease={handleReleaseOrder}
      />

      <StandeeGeneratorModal
        shop={merchant}
        isOpen={isStandeeOpen}
        onClose={() => setIsStandeeOpen(false)}
      />

      <PrinterSettingsModal
        printers={printers}
        isOpen={isPrinterSettingsOpen}
        onClose={() => setIsPrinterSettingsOpen(false)}
        onSavePrinter={handleSavePrinter}
        onDeletePrinter={handleDeletePrinter}
        onTestPrint={handleTestPrint}
      />

      <ManualOrderModal
        printers={printers}
        isOpen={isManualOrderOpen}
        onClose={() => setIsManualOrderOpen(false)}
        onCreateOrder={async (orderPayload) => {
          const res = await fetch(`${API_BASE}/api/v1/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
          });
          const data = await res.json();
          if (data.success && data.order) {
            setOrders((prev) => [data.order, ...prev]);
            setSelectedOrder(data.order);
          }
        }}
      />

    </div>
  );
}
