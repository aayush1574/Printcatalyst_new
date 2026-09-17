import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [merchant, setMerchant] = useState(() => {
    try {
      const cached = localStorage.getItem('pc_merchant_data');
      return cached ? JSON.parse(cached) : null;
    } catch (_) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pc_token') || null);
  
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('pc_admin_token') || null);
  
  const [loading, setLoading] = useState(false);

  // Check merchant & admin sessions on mount in background
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // 1. Check Merchant session if token exists
        const savedToken = localStorage.getItem('pc_token');
        if (savedToken) {
          try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`${API_BASE}/api/v1/merchants/session`, {
              headers: { 'Authorization': `Bearer ${savedToken}` },
              signal: controller.signal
            });
            clearTimeout(tid);
            if (res.ok) {
              const data = await res.json();
              if (data && data.authenticated && data.shop) {
                setMerchant(data.shop);
                localStorage.setItem('pc_merchant_data', JSON.stringify(data.shop));
              } else {
                // Token invalid
                setMerchant(null);
                setToken(null);
                localStorage.removeItem('pc_token');
                localStorage.removeItem('pc_merchant_data');
              }
            } else if (res.status === 401) {
              setMerchant(null);
              setToken(null);
              localStorage.removeItem('pc_token');
              localStorage.removeItem('pc_merchant_data');
            }
          } catch (e) {
            // Ignore offline/timeout error, keep cached state
          }
        }

        // 2. Check Admin session if admin token exists
        const savedAdminToken = localStorage.getItem('pc_admin_token');
        if (savedAdminToken) {
          try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`${API_BASE}/api/v1/admin/session`, {
              headers: { 'Authorization': `Bearer ${savedAdminToken}` },
              signal: controller.signal
            });
            clearTimeout(tid);
            if (res.ok) {
              const data = await res.json();
              if (data && data.authenticated && data.admin) {
                setAdmin(data.admin);
              }
            }
          } catch (e) {
            // Ignore admin check error
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // --- MERCHANT AUTH ---
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/merchants/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.shop) {
        setMerchant(data.shop);
        setToken(data.token);
        localStorage.setItem('pc_token', data.token);
        localStorage.setItem('pc_merchant_data', JSON.stringify(data.shop));
        return { success: true, shop: data.shop };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (e) {
      return { success: false, message: 'Server connection error during login' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/merchants/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.shop) {
        setMerchant(data.shop);
        setToken(data.token);
        localStorage.setItem('pc_token', data.token);
        localStorage.setItem('pc_merchant_data', JSON.stringify(data.shop));
        return { success: true, shop: data.shop };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (e) {
      return { success: false, message: 'Server connection error during registration' };
    }
  };

  const logout = () => {
    setMerchant(null);
    setToken(null);
    localStorage.removeItem('pc_token');
    localStorage.removeItem('pc_merchant_data');
  };

  // --- SUPER ADMIN AUTH ---
  const loginAdmin = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.admin) {
        setAdmin(data.admin);
        setAdminToken(data.token);
        localStorage.setItem('pc_admin_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid master admin credentials' };
    } catch (e) {
      return { success: false, message: 'Server connection error during admin login' };
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    setAdminToken(null);
    localStorage.removeItem('pc_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        merchant,
        setMerchant,
        token,
        login,
        register,
        logout,
        admin,
        adminToken,
        loginAdmin,
        logoutAdmin,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
