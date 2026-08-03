import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const [loading, setLoading] = useState(true);

  // Check auth profile on startup if token exists
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/users/profile');
          const userData = res.data?.user || res.data;
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error) {
          console.warn('Auth token invalid or expired');
          logout();
        }
      } else {
        setUser(null);
        localStorage.removeItem(USER_KEY);
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/users/login', { email, password });
    const data = res.data;
    
    // Support token returning in data.token or header
    const authToken = data.token || data.jwt;
    if (authToken) {
      setToken(authToken);
      localStorage.setItem(TOKEN_KEY, authToken);
    }
    
    const userData = {
      _id: data._id || data.user?._id,
      name: data.name || data.user?.name,
      email: data.email || data.user?.email,
      role: data.role || data.user?.role || 'user',
      age: data.age || data.user?.age,
      gender: data.gender || data.user?.gender,
    };

    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/users', { name, email, password });
    return res.data;
  };

  const updateUser = (newUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...newUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAdmin: user?.role?.toLowerCase() === 'admin',
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
