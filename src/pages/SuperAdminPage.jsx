import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Users, Printer, IndianRupee, Layers, FileText, CheckCircle, Database,
  Server, RefreshCw, Plus, KeyRound, Trash2, Edit3, Eye, EyeOff, Search,
  ExternalLink, LogOut, Check, AlertTriangle, X, ShieldAlert, Sparkles, Lock, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

export default function SuperAdminPage() {
  const { admin, adminToken, loginAdmin, logoutAdmin } = useAuth();

  // Login Form State (if not authenticated)
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Admin Dashboard State
  const [overview, setOverview] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState({});

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  // Add Shop Form
  const [newShopForm, setNewShopForm] = useState({
    shopName: '',
    slug: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    upiId: '',
    plan: 'PRO'
  });

  // Edit Shop Form
  const [editShopForm, setEditShopForm] = useState({
    id: '',
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    upiId: '',
    plan: 'PRO',
    autoPrintEnabled: true
  });

  // Fetch shops & overview
  const loadAdminData = async () => {
    if (!adminToken && !admin) return;
    setLoading(true);
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 3500);

      const [overviewRes, shopsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/overview`, {
          headers: { 'Authorization': `Bearer ${adminToken || 'pc_admin_secret_token_root'}` },
          signal: controller.signal
        }).catch(() => null),
        fetch(`${API_BASE}/api/v1/admin/shops`, {
          headers: { 'Authorization': `Bearer ${adminToken || 'pc_admin_secret_token_root'}` },
          signal: controller.signal
        }).catch(() => null)
      ]);
      clearTimeout(tid);

      const overviewData = overviewRes ? await overviewRes.json().catch(() => null) : null;
      const shopsData = shopsRes ? await shopsRes.json().catch(() => null) : null;

      if (overviewData) {
        setOverview(overviewData);
      }
      if (shopsData && shopsData.shops) {
        setShops(shopsData.shops);
      }
    } catch (e) {
      console.warn('Admin data loaded in offline preview mode:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [admin]);

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    const res = await loginAdmin(adminUsername, adminPassword);
    if (!res.success) {
      setLoginError(res.message || 'Login failed');
    }
    setLoggingIn(false);
  };

  // Toggle Password Reveal
  const togglePasswordReveal = (shopId) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [shopId]: !prev[shopId]
    }));
  };

  // Handle Create Shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken || 'pc_admin_secret_token_root'}`
        },
        body: JSON.stringify(newShopForm)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewShopForm({
          shopName: '',
          slug: '',
          ownerName: '',
          email: '',
          phone: '',
          password: '',
          address: '',
          upiId: '',
          plan: 'PRO'
        });
        loadAdminData();
      } else {
        alert(data.message || 'Failed to create shop');
      }
    } catch (e) {
      console.error('Error creating shop:', e);
      alert('Error creating shop');
    }
  };

  // Handle Edit Shop / Reset Password
  const handleUpdateShop = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/shops/${editShopForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken || 'pc_admin_secret_token_root'}`
        },
        body: JSON.stringify(editShopForm)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        loadAdminData();
      } else {
        alert(data.message || 'Failed to update shop');
      }
    } catch (e) {
      console.error('Error updating shop:', e);
      alert('Error updating shop');
    }
  };

  // Handle Delete Shop
  const handleDeleteShop = async (shop) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${shop.name}"?\nAll associated orders, printers, and settings will be permanently removed.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/shops/${shop.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken || 'pc_admin_secret_token_root'}` }
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
      } else {
        alert(data.message || 'Failed to delete shop');
      }
    } catch (e) {
      console.error('Error deleting shop:', e);
      alert('Error deleting shop');
    }
  };

  // Filtered Shops
  const filteredShops = shops.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If NOT logged in as Super Admin, show Master Login Screen
  if (!admin) {
    return (
      <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans bg-dot-grid selection:bg-amber-500/30">
        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl space-y-6 border-amber-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full"></div>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white font-['Outfit']">Master Admin Portal</h1>
              <p className="text-xs text-slate-400">Restricted Platform Command Center & Shop Management</p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Master Admin Username / Email</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Master Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{loggingIn ? 'Authenticating...' : 'Access Admin Command Center'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <span className="text-amber-400 font-bold block">Default Master Credentials:</span>
              <div className="flex justify-between font-mono">
                <span>Username: <strong className="text-white">admin</strong></span>
                <span>Password: <strong className="text-white">admin123</strong></span>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans bg-dot-grid selection:bg-amber-500/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        
        {/* Admin Header Bar */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                  Super Admin Command Center
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ROOT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Tenant Shop Management · Passwords & Credentials Controller
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Shop</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="Sign out of Super Admin"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Aggregate Telemetry Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl space-y-1">
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Total Print Shops
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{shops.length}</div>
            <span className="text-[10px] text-emerald-400 font-medium">100% active tenants</span>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-1">
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-cyan-400" />
              Connected Printers
            </span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{overview?.activePrinters || 0}</div>
            <span className="text-[10px] text-cyan-300 font-medium">Auto-routed spoolers</span>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-1">
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              Global Orders Fulfilled
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{overview?.totalOrders || 0}</div>
            <span className="text-[10px] text-slate-400 font-medium">{overview?.totalPagesPrinted || 0} pages printed</span>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-1">
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              Total Merchant Volume
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">₹{overview?.totalRevenue || 0}</div>
            <span className="text-[10px] text-emerald-400 font-medium">Direct UPI Settlement</span>
          </div>
        </div>

        {/* Shop Logins & Management Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border-white/10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                Shop Accounts & Credentials Management
              </h2>
              <p className="text-xs text-slate-400">
                View, create, edit login passwords, and manage multi-tenant shop portals.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search shops, owners, phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Shops Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Shop Name & Portal URL</th>
                  <th className="px-4 py-3.5">Owner / Contact</th>
                  <th className="px-4 py-3.5">Login Password</th>
                  <th className="px-4 py-3.5">UPI ID & Plan</th>
                  <th className="px-4 py-3.5 text-center">Printers & Orders</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredShops.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500">
                      No shops found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Shop Name & Portal */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{shop.name}</div>
                        <div className="flex items-center gap-1.5 text-indigo-400 text-[11px] mt-0.5">
                          <span>/portal/{shop.slug}</span>
                          <Link
                            to={`/portal/${shop.slug}`}
                            target="_blank"
                            className="p-0.5 hover:text-white"
                            title="Open Customer Portal"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>

                      {/* Owner & Contact */}
                      <td className="px-4 py-4 space-y-0.5">
                        <div className="font-semibold text-slate-200">{shop.ownerName || 'N/A'}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{shop.phone}</div>
                        {shop.email && <div className="text-slate-500 text-[10px]">{shop.email}</div>}
                      </td>

                      {/* Password Reveal */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/5">
                            {revealedPasswords[shop.id] ? shop.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordReveal(shop.id)}
                            className="p-1 text-slate-400 hover:text-white"
                            title={revealedPasswords[shop.id] ? 'Hide Password' : 'Show Password'}
                          >
                            {revealedPasswords[shop.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* UPI ID & Plan */}
                      <td className="px-4 py-4 space-y-1">
                        <div className="font-mono text-[11px] text-slate-300">{shop.upiId || 'merchant@upi'}</div>
                        <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {shop.plan || 'PRO'}
                        </span>
                      </td>

                      {/* Printers & Orders */}
                      <td className="px-4 py-4 text-center">
                        <div className="text-slate-300 font-bold">{shop.orderCount || 0} Orders</div>
                        <div className="text-[11px] text-slate-500">{shop.printerCount || 0} Printers</div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedShop(shop);
                              setEditShopForm({
                                id: shop.id,
                                name: shop.name,
                                ownerName: shop.ownerName,
                                email: shop.email,
                                phone: shop.phone,
                                password: shop.password,
                                address: shop.address,
                                upiId: shop.upiId,
                                plan: shop.plan || 'PRO',
                                autoPrintEnabled: shop.autoPrintEnabled !== false
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-semibold text-xs border border-indigo-500/40 flex items-center gap-1.5 transition-all"
                            title="Edit Shop & Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Edit / Reset</span>
                          </button>

                          <button
                            onClick={() => handleDeleteShop(shop)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 transition-all"
                            title="Delete Shop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* MODAL: ADD NEW SHOP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border-indigo-500/40">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Add New Print Shop</h3>
                  <p className="text-xs text-slate-400">Create login credentials and portal for a new shop tenant</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Print Shop Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Xerox & Print Hub"
                    value={newShopForm.shopName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setNewShopForm({ ...newShopForm, shopName: name, slug: newShopForm.slug || autoSlug });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Custom Portal Slug *</label>
                  <input
                    type="text"
                    placeholder="e.g. apex-xerox"
                    value={newShopForm.slug}
                    onChange={(e) => setNewShopForm({ ...newShopForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Owner Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sanjay Verma"
                    value={newShopForm.ownerName}
                    onChange={(e) => setNewShopForm({ ...newShopForm, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Owner Phone (Login Username) *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newShopForm.phone}
                    onChange={(e) => setNewShopForm({ ...newShopForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Owner Email</label>
                  <input
                    type="email"
                    placeholder="sanjay@apexprint.in"
                    value={newShopForm.email}
                    onChange={(e) => setNewShopForm({ ...newShopForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Shop Login Password *</label>
                  <input
                    type="text"
                    placeholder="e.g. secret123"
                    value={newShopForm.password}
                    onChange={(e) => setNewShopForm({ ...newShopForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Shop UPI ID (For Direct Payments)</label>
                  <input
                    type="text"
                    placeholder="apexprint@okaxis"
                    value={newShopForm.upiId}
                    onChange={(e) => setNewShopForm({ ...newShopForm, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Plan</label>
                  <select
                    value={newShopForm.plan}
                    onChange={(e) => setNewShopForm({ ...newShopForm, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="GROWTH">Growth</option>
                    <option value="PRO">Pro</option>
                    <option value="SCALE">Scale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Physical Address</label>
                <input
                  type="text"
                  placeholder="Shop No. 12, University Market, Delhi"
                  value={newShopForm.address}
                  onChange={(e) => setNewShopForm({ ...newShopForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Shop & Generate Portal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SHOP & RESET PASSWORD */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border-indigo-500/40">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Edit Shop & Reset Credentials</h3>
                  <p className="text-xs text-slate-400">Modifying settings for {selectedShop?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShop} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Shop Business Name</label>
                  <input
                    type="text"
                    value={editShopForm.name}
                    onChange={(e) => setEditShopForm({ ...editShopForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Owner Full Name</label>
                  <input
                    type="text"
                    value={editShopForm.ownerName}
                    onChange={(e) => setEditShopForm({ ...editShopForm, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Owner Phone (Login Username)</label>
                  <input
                    type="tel"
                    value={editShopForm.phone}
                    onChange={(e) => setEditShopForm({ ...editShopForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Owner Email</label>
                  <input
                    type="email"
                    value={editShopForm.email}
                    onChange={(e) => setEditShopForm({ ...editShopForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Instant Password Reset Box */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <label className="text-amber-300 block font-bold text-xs flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Reset Shop Login Password
                </label>
                <input
                  type="text"
                  value={editShopForm.password}
                  onChange={(e) => setEditShopForm({ ...editShopForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-200 text-xs font-mono focus:border-amber-400 focus:outline-none"
                  placeholder="Enter new password"
                  required
                />
                <span className="text-[10px] text-amber-400/80 block">
                  The shop owner can immediately log in using this new password.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Direct UPI ID</label>
                  <input
                    type="text"
                    value={editShopForm.upiId}
                    onChange={(e) => setEditShopForm({ ...editShopForm, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Subscription Plan</label>
                  <select
                    value={editShopForm.plan}
                    onChange={(e) => setEditShopForm({ ...editShopForm, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="GROWTH">Growth</option>
                    <option value="PRO">Pro</option>
                    <option value="SCALE">Scale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Physical Shop Address</label>
                <input
                  type="text"
                  value={editShopForm.address}
                  onChange={(e) => setEditShopForm({ ...editShopForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes & Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
