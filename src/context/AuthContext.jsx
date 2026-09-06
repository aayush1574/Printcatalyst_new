import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [merchant, setMerchant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pc_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check or load default demo session
    const loadSession = async () => {
      try {
        const res = await fetch('/api/v1/merchants/session');
        const data = await res.json();
        if (data.authenticated && data.shop) {
          setMerchant(data.shop);
        } else {
          // Default fallback demo shop
          setMerchant({
            id: 'shop_demo',
            slug: 'catalyst-print-hub',
            name: 'Catalyst Print & Stationery Hub',
            ownerName: 'Rajesh Sharma',
            email: 'rajesh@printcatalyst.in',
            phone: '+91 98765 43210',
            plan: 'PRO',
            agentToken: 'agt_tok_demo_88392019482'
          });
        }
      } catch (e) {
        console.warn('Backend not ready yet, using default demo session', e);
        setMerchant({
          id: 'shop_demo',
          slug: 'catalyst-print-hub',
          name: 'Catalyst Print & Stationery Hub',
          ownerName: 'Rajesh Sharma',
          email: 'rajesh@printcatalyst.in',
          phone: '+91 98765 43210',
          plan: 'PRO',
          agentToken: 'agt_tok_demo_88392019482'
        });
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/v1/merchants/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setMerchant(data.shop);
        setToken(data.token);
        localStorage.setItem('pc_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Server error during login' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await fetch('/api/v1/merchants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMerchant(data.shop);
        setToken(data.token);
        localStorage.setItem('pc_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = () => {
    setMerchant(null);
    setToken(null);
    localStorage.removeItem('pc_token');
  };

  return (
    <AuthContext.Provider value={{ merchant, setMerchant, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
