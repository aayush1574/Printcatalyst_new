import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [merchant, setMerchant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pc_token') || null);
  
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('pc_admin_token') || null);
  
  const [loading, setLoading] = useState(true);

  // Check merchant & admin sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // 1. Check Merchant session if token exists
        const savedToken = localStorage.getItem('pc_token');
        if (savedToken) {
          try {
            const res = await fetch(`${API_BASE}/api/v1/merchants/session`, {
              headers: { 'Authorization': `Bearer ${savedToken}` }
            });
            const data = await res.json();
            if (data.authenticated && data.shop) {
              setMerchant(data.shop);
            }
          } catch (e) {
            console.warn('Merchant session check error:', e);
          }
        }

        // 2. Check Admin session if admin token exists
        const savedAdminToken = localStorage.getItem('pc_admin_token');
        if (savedAdminToken) {
          try {
            const res = await fetch(`${API_BASE}/api/v1/admin/session`, {
              headers: { 'Authorization': `Bearer ${savedAdminToken}` }
            });
            const data = await res.json();
            if (data.authenticated && data.admin) {
              setAdmin(data.admin);
            }
          } catch (e) {
            console.warn('Admin session check error:', e);
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
