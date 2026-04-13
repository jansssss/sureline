'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext({ isAdmin: false, login: async () => false, logout: () => {} });

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    fetch('/api/admin/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (r.ok) setIsAdmin(true); else localStorage.removeItem('admin_token'); })
      .catch(() => localStorage.removeItem('admin_token'));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return false;
    const { token } = await res.json();
    localStorage.setItem('admin_token', token);
    setIsAdmin(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
