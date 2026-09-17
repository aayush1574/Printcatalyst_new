import React from 'react';
import { RefreshCw, AlertTriangle, Home, LogOut } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 [ErrorBoundary caught]:', error, errorInfo);

    // Auto-recover from stale Vercel chunk deployment errors
    const errMsg = String(error?.message || '');
    if (
      errMsg.includes('Failed to fetch dynamically imported module') ||
      errMsg.includes('Loading chunk') ||
      errMsg.includes('Importing a module script failed')
    ) {
      const hasReloaded = window.sessionStorage.getItem('chunk_reload_attempted');
      if (!hasReloaded) {
        window.sessionStorage.setItem('chunk_reload_attempted', 'true');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.sessionStorage.removeItem('chunk_reload_attempted');
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('pc_token');
      localStorage.removeItem('pc_merchant_data');
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = '/merchant';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-indigo-500 selection:text-white">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white font-['Outfit']">Workspace Interrupted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                A temporary network or cache sync issue occurred while loading this workspace.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-left font-mono text-[11px] text-slate-400 overflow-x-auto max-h-24">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Dashboard</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Clear Session &amp; Re-Login</span>
              </button>

              <a
                href="/"
                className="text-[11px] text-slate-500 hover:text-slate-300 pt-1 transition-colors flex items-center justify-center gap-1"
              >
                <Home className="w-3 h-3" />
                <span>Return to Homepage</span>
              </a>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
