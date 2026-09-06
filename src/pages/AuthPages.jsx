import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Printer, ArrowRight, Lock, Mail, ShieldCheck, Phone,
  Sparkles, CheckCircle2, QrCode, AlertCircle, Building, User, IndianRupee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(email, password);
    if (res.success) {
      navigate('/merchant');
    } else {
      setError(res.message || 'Invalid shop email/phone or password');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans bg-dot-grid relative overflow-hidden">
      <Navbar />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-1 flex items-center justify-center p-4 py-16 relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl space-y-6 border-white/10 relative">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-600/30 mx-auto flex items-center justify-center">
              <div className="w-full h-full bg-[#070a13] rounded-[14px] flex items-center justify-center">
                <Printer className="w-7 h-7 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white font-['Outfit']">Shop Owner Login</h1>
            <p className="text-xs text-slate-400">Sign in to your print shop dashboard & order spooler</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Registered Email or Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210 or shop@print.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Shop Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              <span>{submitting ? 'Connecting...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 space-y-2 border-t border-white/5">
            <div>
              New print shop?{' '}
              <Link to="/register" className="text-indigo-400 font-bold hover:underline">
                Create shop account
              </Link>
            </div>
            <div>
              Master platform admin?{' '}
              <Link to="/admin" className="text-amber-400 font-bold hover:underline">
                Super Admin Login
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export function RegisterPage() {
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    upiId: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await register(formData);
    if (res.success) {
      navigate('/merchant');
    } else {
      setError(res.message || 'Registration failed');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans bg-dot-grid relative overflow-hidden">
      <Navbar />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-xl shadow-2xl space-y-6 border-white/10">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-600/30 mx-auto flex items-center justify-center">
              <div className="w-full h-full bg-[#070a13] rounded-[14px] flex items-center justify-center">
                <Building className="w-7 h-7 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">Register Your Print Shop</h1>
            <p className="text-xs text-slate-400">Onboard in 60 seconds — Instant QR portal & printer routing</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Print Shop Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Xerox & Print Hub"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Owner Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sanjay Verma"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Mobile Number (Login Username) *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="sanjay@apexprint.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                Merchant Direct UPI ID (For Customer QR Payments) *
              </label>
              <input
                type="text"
                placeholder="apexprint@okaxis"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Shop Physical Address</label>
              <input
                type="text"
                placeholder="Shop 12, Main Market, Delhi"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Create Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Shop...' : 'Create Shop & Access Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-400 font-bold hover:underline">
              Log in to your shop
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
