import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('oxima_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('oxima_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          if (res.data.data.driver) {
            setDriver(res.data.data.driver);
          }
          connectSocket(storedToken);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, data } = res.data;
    
    localStorage.setItem('oxima_token', newToken);
    setToken(newToken);
    setUser(data.user);
    setDriver(data.driver || null);
    
    connectSocket(newToken);
    return data.user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, data } = res.data;

    localStorage.setItem('oxima_token', newToken);
    setToken(newToken);
    setUser(data.user);
    setDriver(data.driver || null);

    connectSocket(newToken);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('oxima_token');
    setToken(null);
    setUser(null);
    setDriver(null);
    disconnectSocket();
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      if (res.data.data.driver) {
        setDriver(res.data.data.driver);
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err);
    }
  };

  const topupWallet = async (amount) => {
    const res = await api.post('/auth/wallet/topup', { amount });
    setUser(prev => ({ ...prev, walletBalance: res.data.data.walletBalance }));
    return res.data.data.walletBalance;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        driver,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        topupWallet,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
