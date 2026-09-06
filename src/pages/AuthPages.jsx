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
              Need a new shop workspace?{' '}
              <span className="text-slate-300 font-medium">
                Provisioned exclusively by Platform Admin
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <Link to="/admin" className="text-amber-400 font-bold hover:underline">
                Super Admin Login →
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
  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans bg-dot-grid relative overflow-hidden">
      <Navbar />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-1 flex items-center justify-center p-4 py-16 relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-lg shadow-2xl space-y-6 border-white/10 text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-indigo-600/20 to-blue-500/20 border border-amber-500/30 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin-Managed Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">Shop Registration Restricted</h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              New merchant shop accounts and hardware spooler credentials are created and managed exclusively by the Platform Administrator.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 text-xs">
            <span className="font-bold text-white block">How to get your shop activated:</span>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Contact your platform administrator or support team.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Provide your store name, owner WhatsApp number, and printer model.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Receive your merchant login credentials instantly.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to="/merchant"
              className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <User className="w-4 h-4" />
              <span>Merchant Sign In</span>
            </Link>
            <Link
              to="/admin"
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin Portal</span>
            </Link>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500">
            For support & instant onboarding queries: <span className="text-indigo-400 font-mono">support@printsupport.in</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
