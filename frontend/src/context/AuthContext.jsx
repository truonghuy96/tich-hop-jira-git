
import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

/**
 * @typedef {Object} User
 * @property {string} [token]
 * @property {string} [hoTen]
 * @property {string} [role]
 * @property {string} [groupRole]
 * @property {string} [username]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User | null} user
 * @property {Function} login
 * @property {Function} logout
 * @property {boolean} loading
 */

// SỬA TẠI ĐÂY: Ép kiểu giá trị null để IDE không báo lỗi assignable
/** @type {React.Context<AuthContextType>} */
const AuthContext = createContext(/** @type {AuthContextType} */ (null));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { username, password });
      const userData = response.data;

      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Đăng nhập thất bại';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, login, logout, loading }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);