import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, LayoutDashboard, QrCode, Settings, Sliders,
  TrendingUp, Download, Plus, CheckCircle, Clock, AlertTriangle,
  Play, RefreshCw, Smartphone, Layers, Eye, FileText, Check, ShieldCheck, ChevronRight,
  Wifi, WifiOff, Sparkles, User, HelpCircle, Volume2, LogOut, Lock, X, Menu, ChevronDown
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

  const [activeTab, setActiveTab] = useState('JOBS');
  const [orders, setOrders] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [copiedPortalLink, setCopiedPortalLink] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isStandeeOpen, setIsStandeeOpen] = useState(false);
  const [isPrinterSettingsOpen, setIsPrinterSettingsOpen] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);

  // Load initial shop data
  const loadDashboardData = async () => {
    if (!token || !merchant?.id) {
      setLoading(false);
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const shopId = merchant.id;

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);

      const [ordersRes, printersRes, profileRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/jobs?shopId=${shopId}`, { headers, signal: controller.signal }).catch(() => null),
        fetch(`${API_BASE}/api/v1/printers/list?shopId=${shopId}`, { headers, signal: controller.signal }).catch(() => null),
        fetch(`${API_BASE}/api/v1/merchants/profile`, { headers, signal: controller.signal }).catch(() => null)
      ]);
      clearTimeout(tid);

      const ordersData = ordersRes ? await ordersRes.json().catch(() => null) : null;
      const printersData = printersRes ? await printersRes.json().catch(() => null) : null;
      const profileData = profileRes ? await profileRes.json().catch(() => null) : null;

      if (ordersData && ordersData.orders) {
        setOrders(ordersData.orders);
        if (ordersData.orders.length > 0) {
          setSelectedOrder(ordersData.orders[0]);
        }
      }
      
      if (Array.isArray(printersData)) {
        setPrinters(printersData);
      } else {
        setPrinters([]);
      }

      if (profileData && profileData.id) {
        setMerchant(profileData);
      }
    } catch (e) {
      console.warn('Error loading merchant dashboard data:', e);
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

  // Direct Browser Print (Zero setup / no install required)
  const handleBrowserPrint = (order) => {
    if (!order) return;
    const fileUrl = order.items?.[0]?.fileUrl;
    if (fileUrl) {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE}${fileUrl}`;
      const printWindow = window.open(fullUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        setTimeout(() => {
          try { printWindow.print(); } catch (e) {}
        }, 1200);
      }
    } else {
      window.print();
    }
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
    if (statusFilter === 'PRINTING') return o.status === 'PRINTING' || o.status === 'IN_SPOOL';
    if (statusFilter === 'COMPLETED') return o.status === 'COMPLETED';
    if (statusFilter === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  const isAgentOnline = merchant?.agentStatus === 'ONLINE';
  const readyCount = orders.filter(o => o.status === 'READY_TO_PRINT').length;

  // Strict Authentication Guard
  if (!token || !merchant) {
    return <MerchantAuthGate />;
  }

  // Handle order select - on mobile open detail panel
  const handleSelectOrder = (ord) => {
    setSelectedOrder(ord);
    if (window.innerWidth < 1024) {
      setMobileDetailOpen(true);
    }
  };

  const navItems = [
    { id: 'JOBS', icon: LayoutDashboard, label: 'Queue', badge: readyCount || null },
    { id: 'PRINTERS', icon: Printer, label: 'Printers' },
    { id: 'STANDEE', icon: QrCode, label: 'QR Standee' },
    { id: 'AGENT', icon: Layers, label: 'Agent' },
    { id: 'ANALYTICS', icon: TrendingUp, label: 'Analytics' },
    { id: 'SETTINGS', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* ── Top Navigation Bar ── */}
      <header className="bg-slate-950 border-b border-slate-800/90 sticky top-0 z-40">
        <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-bold text-white text-sm tracking-tight hidden sm:inline font-['Outfit']">
                Print Support
              </span>
            </Link>

            <span className="text-slate-600 hidden sm:inline">|</span>
            <h2 className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-none">
              {merchant?.name || 'Print Support'}
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-shrink-0">
            
            {/* Agent Status - compact on mobile */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold border ${
                isAgentOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isAgentOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">Agent:</span>
              <span>{isAgentOnline ? 'ON' : 'OFF'}</span>
            </div>

            {/* Auto Print Toggle */}
            <button
              onClick={handleToggleAutoPrint}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold transition-all border ${
                merchant?.autoPrintEnabled
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${merchant?.autoPrintEnabled ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
              <span className="hidden sm:inline">Auto:</span>
              <span>{merchant?.autoPrintEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* New Order */}
            <button
              onClick={() => setIsManualOrderOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline text-xs">New Order</span>
            </button>

            {/* QR Standee - hidden on small mobile */}
            <button
              onClick={() => setIsStandeeOpen(true)}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 font-semibold items-center gap-1.5 border border-indigo-700/60 transition-colors text-xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">QR Standee</span>
            </button>

            {/* Portal Link - desktop only */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-indigo-300 font-mono">/portal/{merchant?.slug}</span>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/portal/${merchant?.slug || 'printsupport-hub'}`;
                  navigator.clipboard.writeText(url);
                  setCopiedPortalLink(true);
                  setTimeout(() => setCopiedPortalLink(false), 2000);
                }}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
              >
                {copiedPortalLink ? 'Copied!' : 'Copy'}
              </button>
              <Link
                to={`/portal/${merchant?.slug || 'printsupport-hub'}`}
                target="_blank"
                className="p-1 text-slate-300 hover:text-white transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── Desktop Sidebar (hidden on mobile, shown sm+) ── */}
        <aside className="hidden sm:flex w-14 md:w-56 bg-slate-950 border-r border-slate-800/90 flex-col justify-between py-3 flex-shrink-0">
          <div className="space-y-1 px-1.5 md:px-3">
            {navItems.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                className={`w-full flex items-center gap-2.5 px-2 md:px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === nav.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title={nav.label}
              >
                <nav.icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">{nav.label}</span>
                {nav.badge && (
                  <span className="hidden md:inline-block ml-auto px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px]">
                    {nav.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bottom user info - desktop only */}
          <div className="px-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 hidden md:block space-y-1.5">
            <div className="flex items-center gap-2 truncate">
              <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate font-medium">{merchant?.ownerName || 'Shop Owner'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate">
              {merchant?.name}
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 flex overflow-hidden bg-slate-900/40 min-w-0">
          
          {/* ═══ TAB: LIVE JOBS ═══ */}
          {activeTab === 'JOBS' && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-w-0">
              
              {/* Center: Orders List */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                
                {/* Filter Bar - horizontally scrollable */}
                <div className="p-2.5 sm:p-4 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto flex-shrink-0">
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs flex-shrink-0">
                    {[
                      { id: 'ALL', label: `All (${orders.length})` },
                      { id: 'READY', label: `Ready (${orders.filter(o => o.status === 'READY_TO_PRINT' || o.status === 'PENDING_APPROVAL').length})` },
                      { id: 'PRINTING', label: `Printing (${orders.filter(o => o.status === 'IN_SPOOL' || o.status === 'PRINTING').length})` },
                      { id: 'COMPLETED', label: `Done (${orders.filter(o => o.status === 'COMPLETED').length})` },
                      { id: 'CANCELLED', label: `Rejected` }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
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
                    className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-900 flex-shrink-0 ml-auto"
                    title="Refresh"
                  >
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Orders Scrollable List */}
                <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 text-slate-500 text-xs">
                      <Printer className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p>No orders in this category.</p>
                      <button
                        onClick={() => setIsManualOrderOpen(true)}
                        className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                      >
                        + Create Order
                      </button>
                    </div>
                  ) : (
                    filteredOrders.map((ord) => {
                      const isSelected = selectedOrder?.id === ord.id;
                      const item = ord.items?.[0] || {};

                      return (
                        <div
                          key={ord.id}
                          onClick={() => handleSelectOrder(ord)}
                          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Order Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-black text-[10px] sm:text-xs bg-indigo-950 text-indigo-300 px-1.5 sm:px-2 py-0.5 rounded border border-indigo-800 flex-shrink-0">
                                #{ord.pickupToken || ord.id?.replace('ORD-', '') || '?'}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                  {ord.customerName}
                                  <span className="text-[10px] text-slate-400 font-normal ml-1 hidden sm:inline">({ord.customerPhone})</span>
                                </h4>
                                <p className="text-[10px] sm:text-[11px] text-indigo-300 truncate">
                                  {item.fileName} ({item.pageCount || '?'} pg × {item.copies || 1} cp)
                                </p>
                              </div>
                            </div>

                            <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${
                              ord.status === 'READY_TO_PRINT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              ord.status === 'IN_SPOOL' || ord.status === 'PRINTING' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse' :
                              ord.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {ord.status === 'IN_SPOOL' ? 'PRINTING' : ord.status?.replace(/_/g, ' ') || 'UNKNOWN'}
                            </span>
                          </div>

                          {/* Quick Specs & Print Button */}
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 text-[9px] sm:text-[10px]">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded font-medium ${item.colorMode === 'COLOR' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                                {item.colorMode === 'COLOR' ? 'Color' : 'B&W'}
                              </span>
                              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-medium">
                                {item.paperSize} · {item.duplex === 'DOUBLE_SIDED' ? 'Duplex' : 'Single'}
                              </span>
                            </div>

                            {/* Print Button */}
                            {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReleaseOrder(ord.id);
                                }}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-white font-bold text-[10px] sm:text-xs shadow-sm flex items-center gap-1 transition-all ${
                                  ord.status === 'PRINTING' || ord.status === 'IN_SPOOL'
                                    ? 'bg-indigo-600 hover:bg-indigo-500'
                                    : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
                                }`}
                              >
                                <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span>{ord.status === 'PRINTING' || ord.status === 'IN_SPOOL' ? 'Printing...' : 'Print'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Panel: Order Detail - Desktop (hidden on mobile, use slide-over instead) */}
              <div className="hidden lg:flex w-96 bg-slate-950 p-5 overflow-y-auto flex-col space-y-5 flex-shrink-0 border-l border-slate-800/80">
                <OrderDetailPanel
                  selectedOrder={selectedOrder}
                  onOpenStudio={() => setIsStudioOpen(true)}
                  onRelease={handleReleaseOrder}
                  onReject={handleRejectOrder}
                  onBrowserPrint={handleBrowserPrint}
                />
              </div>
            </div>
          )}

          {/* ═══ TAB: PRINTERS ═══ */}
          {activeTab === 'PRINTERS' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto text-xs">
              {/* Header & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Printer className="w-5 h-5 text-indigo-400" />
                    Connected Printers & Auto-Routing
                  </h2>
                  <p className="text-slate-400 text-xs">Manage local USB / Wi-Fi printers, queues, and 1-click silent spooling</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`${API_BASE}/api/v1/agent/download-connector?shopId=${merchant?.id || 'shop_demo'}`}
                    download
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 text-xs transition-all active:scale-95"
                    title="Download 1-click installer that auto-detects all your printers on Windows without typing any commands"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download 1-Click Connector (.bat)</span>
                  </a>

                  <button
                    onClick={() => setIsPrinterSettingsOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-2 border border-slate-700 text-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Queue</span>
                  </button>
                </div>
              </div>

              {/* Zero-Command Setup Guide Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: Direct Browser Print */}
                <div className="bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900/60 p-4 sm:p-5 rounded-2xl border border-indigo-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Method 1: Zero Setup (Instant)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Always Ready
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Browser Direct Print</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    No software download required. Any printer already connected to this PC works automatically when you click <strong className="text-white">"Print in Browser"</strong> on incoming orders.
                  </p>
                  <div className="text-[11px] text-indigo-300/80 font-medium">
                    ✓ Zero installation · Works on Chrome, Edge, Mac & Windows
                  </div>
                </div>

                {/* Method 2: 1-Click Auto-Detect Silent Spooler */}
                <div className="bg-gradient-to-br from-emerald-950/30 via-slate-950 to-slate-900/60 p-4 sm:p-5 rounded-2xl border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      Method 2: 1-Click Silent Auto-Print
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      merchant?.agentStatus === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {merchant?.agentStatus === 'ONLINE' ? '🟢 Connector Active' : '⚪ Connector Standby'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Auto-Detect Windows Spooler</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Download the 1-Click Connector file and double-click it. It automatically reads all Canon, HP, Epson, Brother printers on your PC and enables instant hands-free printing.
                  </p>
                  <div className="text-[11px] text-emerald-300/80 font-medium">
                    ✓ No command line · Auto-detects in 2 seconds
                  </div>
                </div>
              </div>

              {/* Printer Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {printers.map((p) => (
                  <div key={p.id} className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {p.autoDetected && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold" title="Auto-discovered from Windows spooler">
                            Auto-Detected
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                          {p.status || 'READY'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug truncate" title={p.name}>{p.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.connection} · {p.type?.replace('_', ' ')}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Color:</span>
                        <span className={p.supportsColor ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          {p.supportsColor ? 'Color + B&W' : 'Mono Only'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Duplex:</span>
                        <span className="text-white font-medium">{p.supportsDuplex ? 'Auto Duplex' : 'Single'}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Default Role:</span>
                        <span className="text-indigo-300 font-medium">
                          {p.isDefaultMono ? 'Default B&W' : (p.isDefaultColor ? 'Default Color' : 'Secondary')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTestPrint(p.id)}
                      className="w-full mt-2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Test Print</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB: SHOP QR STANDEE ═══ */}
          {activeTab === 'STANDEE' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-400" />
                    Counter QR Standee
                  </h2>
                  <p className="text-slate-400 text-xs">Print QR standees for your counter</p>
                </div>

                <button
                  onClick={() => setIsStandeeOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 self-start"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Designer</span>
                </button>
              </div>

              <div className="bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                <p className="text-slate-300 text-xs sm:text-sm">
                  Generate and print your permanent Shop QR standee. Walk-in customers scan the QR to upload documents and send directly to your print queue.
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

          {/* ═══ TAB: DESKTOP AGENT ═══ */}
          {activeTab === 'AGENT' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto text-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Desktop Bridge Agent
                </h2>
                <p className="text-slate-400 text-xs">Background spooler for Windows, Mac & Linux</p>
              </div>

              <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isAgentOnline ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {isAgentOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Status: <span className={isAgentOnline ? 'text-emerald-400' : 'text-amber-400'}>{merchant?.agentStatus}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Token: <span className="font-mono text-indigo-300">{merchant?.agentToken}</span></p>
                    </div>
                  </div>

                  <a
                    href={`${API_BASE}/api/v1/agent/script`}
                    download="printsupport-agent.js"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-md self-start"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Agent</span>
                  </a>
                </div>

                <div className="bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
                    <li>Download the agent script to the printer computer.</li>
                    <li>Run: <code className="bg-black/50 px-2 py-0.5 rounded text-indigo-300 font-mono">npm run agent</code></li>
                    <li>The agent auto-discovers printers and starts spooling!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: ANALYTICS ═══ */}
          {activeTab === 'ANALYTICS' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto text-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Print Analytics
                </h2>
                <p className="text-slate-400 text-xs">Order volume and usage statistics</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium text-[11px]">Total Orders</span>
                  <div className="text-2xl font-black text-white font-mono">{orders.length}</div>
                  <span className="text-[10px] text-emerald-400">100% fulfill rate</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium text-[11px]">Pages Printed</span>
                  <div className="text-2xl font-black text-indigo-400 font-mono">
                    {orders.reduce((sum, o) => sum + (o.items || []).reduce((acc, i) => acc + (i.computedPages || (i.pageCount * i.copies) || 0), 0), 0)}
                  </div>
                  <span className="text-[10px] text-indigo-300">All modes</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium text-[11px]">Printers</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">{printers.length}</div>
                  <span className="text-[10px] text-cyan-300">Connected</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: SETTINGS ═══ */}
          {activeTab === 'SETTINGS' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-w-3xl mx-auto text-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  Business Profile & UPI
                </h2>
                <p className="text-slate-400 text-xs">Manage shop info, UPI ID, and automation</p>
              </div>

              <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Shop Name</label>
                  <input
                    type="text"
                    value={merchant?.name || ''}
                    onChange={(e) => setMerchant({ ...merchant, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <label className="text-slate-400 block mb-1 font-medium">Phone</label>
                    <input
                      type="text"
                      value={merchant?.phone || ''}
                      onChange={(e) => setMerchant({ ...merchant, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">UPI ID</label>
                  <input
                    type="text"
                    value={merchant?.upiId || ''}
                    onChange={(e) => setMerchant({ ...merchant, upiId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Address</label>
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
                    alert('Profile updated!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Mobile Bottom Navigation (visible only on mobile) ── */}
      <nav className="sm:hidden bg-slate-950 border-t border-slate-800 flex items-center justify-around py-1.5 px-1 z-40 flex-shrink-0">
        {navItems.slice(0, 5).map((nav) => (
          <button
            key={nav.id}
            onClick={() => setActiveTab(nav.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors relative ${
              activeTab === nav.id
                ? 'text-indigo-400'
                : 'text-slate-500'
            }`}
          >
            <nav.icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            <span className="text-[9px] font-semibold">{nav.label}</span>
            {nav.badge && (
              <span className="absolute -top-0.5 right-0 w-4 h-4 rounded-full bg-emerald-500 text-[8px] text-white font-bold flex items-center justify-center">
                {nav.badge}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
            activeTab === 'SETTINGS' ? 'text-indigo-400' : 'text-slate-500'
          }`}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-semibold">More</span>
        </button>
      </nav>

      {/* ── Mobile Order Detail Slide-Over ── */}
      {mobileDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileDetailOpen(false)} />
          
          {/* Panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-800 flex-shrink-0">
              <h3 className="text-sm font-bold text-white">Order Details</h3>
              <button
                onClick={() => setMobileDetailOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <OrderDetailPanel
                selectedOrder={selectedOrder}
                onOpenStudio={() => { setMobileDetailOpen(false); setIsStudioOpen(true); }}
                onRelease={handleReleaseOrder}
                onReject={handleRejectOrder}
                onBrowserPrint={handleBrowserPrint}
              />
            </div>
          </div>
        </div>
      )}

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

      {/* Inline animation style */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>

    </div>
  );
}


/* ─── Order Detail Panel (reusable between desktop sidebar and mobile slide-over) ─── */
function OrderDetailPanel({ selectedOrder, onOpenStudio, onRelease, onReject, onBrowserPrint }) {
  if (!selectedOrder) {
    return (
      <div className="text-center py-16 text-slate-500 text-xs">
        Select an order to view details.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-indigo-400 font-bold">Order #{selectedOrder.pickupToken || selectedOrder.id?.replace('ORD-', '')}</span>
          <span className="font-mono font-black text-sm bg-indigo-950 text-indigo-300 px-3 py-0.5 rounded-lg border border-indigo-800">
            Token: {selectedOrder.pickupToken}
          </span>
        </div>
        <h3 className="text-base font-bold text-white mt-1">{selectedOrder.customerName}</h3>
        <p className="text-slate-400 text-xs">{selectedOrder.customerPhone} · {new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
      </div>

      {/* Pre-flight CTA */}
      <button
        onClick={onOpenStudio}
        className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors shadow-sm"
      >
        <Eye className="w-4 h-4 text-indigo-400" />
        <span>Open Document Studio</span>
      </button>

      {/* Specs */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Print Specs</h4>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
          {[
            ['File', selectedOrder.items?.[0]?.fileName],
            ['Paper', `${selectedOrder.items?.[0]?.paperSize} (${selectedOrder.items?.[0]?.paperType})`],
            ['Color', selectedOrder.items?.[0]?.colorMode === 'COLOR' ? 'Full Color' : 'B&W'],
            ['Sides', selectedOrder.items?.[0]?.duplex === 'DOUBLE_SIDED' ? 'Double Sided' : 'Single'],
            ['Copies', selectedOrder.items?.[0]?.copies],
            ['Finishing', selectedOrder.items?.[0]?.finishing?.replace('_', ' ') || 'None'],
            ['Printer', selectedOrder.assignedPrinterName],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-slate-400">{label}:</span>
              <span className="text-white font-medium truncate max-w-[170px] text-right">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Audit Logs</h4>
        <div className="space-y-1.5 max-h-28 overflow-y-auto font-mono text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          {(selectedOrder.logs || []).map((l, i) => (
            <div key={i} className="leading-snug">
              <span className="text-slate-500">[{new Date(l.timestamp).toLocaleTimeString()}]</span> {l.text}
            </div>
          ))}
          {(!selectedOrder.logs || selectedOrder.logs.length === 0) && (
            <div className="text-slate-500">No audit logs</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
          <div className="space-y-2">
            <button
              onClick={() => onRelease(selectedOrder.id)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{selectedOrder.status === 'PRINTING' || selectedOrder.status === 'IN_SPOOL' ? 'Printing...' : 'Print Now (Silent Spool)'}</span>
            </button>

            <button
              onClick={() => onBrowserPrint && onBrowserPrint(selectedOrder)}
              className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              title="Opens document in browser print dialog - zero software required"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print in Browser (Zero Setup)</span>
            </button>
          </div>
        )}

        {selectedOrder.status !== 'CANCELLED' && (
          <button
            onClick={() => onReject(selectedOrder.id)}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 text-xs font-semibold transition-colors"
          >
            Cancel / Reject
          </button>
        )}
      </div>
    </div>
  );
}


/* ─── Merchant Auth Gate ─── */
function MerchantAuthGate() {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(loginForm.email, loginForm.password);
    if (!res.success) {
      setError(res.message || 'Invalid shop email/phone or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans bg-dot-grid relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[300px] sm:h-[380px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 font-bold">
            <Printer className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white text-sm sm:text-base tracking-tight font-['Outfit']">
            Print Support <span className="text-indigo-400 font-mono text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 ml-1">PRO</span>
          </span>
        </Link>
        <Link
          to="/"
          className="text-[10px] sm:text-xs text-slate-400 hover:text-white px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors"
        >
          ← Home
        </Link>
      </header>

      {/* Auth Box */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 py-8 sm:py-12 relative z-10">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-10 w-full max-w-lg shadow-2xl border-white/10 space-y-5 sm:space-y-6">
          
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authorized Access
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white font-['Outfit']">
              Shop Owner Sign In
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">
              Sign in with your registered phone or email to access print queues.
            </p>
          </div>

          {/* Admin notice */}
          <div className="p-3 rounded-xl sm:rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 text-[11px] sm:text-xs flex items-start gap-2">
            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-400" />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Protected Terminal</span>
              <p className="text-slate-400 text-[10px] sm:text-[11px] leading-relaxed">
                Accounts are provisioned by admin. Contact Super Admin for credentials.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Email or Phone
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Show password</span>
              </label>
              <Link to="/admin" className="text-amber-400 hover:underline">
                Admin Login →
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-3 sm:pt-4 border-t border-slate-800 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              Encrypted Session
            </span>
            <Link to="/portal/printsupport-hub" className="text-indigo-400 hover:underline">
              Customer Portal →
            </Link>
          </div>

        </div>
      </main>

    </div>
  );
}
