import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useCartStore } from '../store';

const AuthContext = createContext();

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider component.
 * 
 * @returns {Object} Authentication context with user, loading, login, register, logout, checkAuth
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const setCartUser = useCartStore((state) => state.setUser);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Synchronize cart with authentication state.
   * When user logs in, associate cart with their account.
   * When user logs out, clear the cart to prevent data leakage.
   */
  useEffect(() => {
    if (user) {
      setCartUser(user._id);
    } else {
      clearCart();
    }
  }, [user, setCartUser, clearCart]);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authenticates a user with email and password.
   * On success, updates the user state and cart association.
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Result with success boolean and optional message
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        toast.success('Logged in successfully');
        return { success: true };
      } else {
        toast.error('Login failed: Invalid response from server');
        return { success: false, message: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  /**
   * Registers a new user account.
   * Automatically logs in the user upon successful registration.
   * 
   * @param {Object} userData - User registration data (name, email, password, etc.)
   * @returns {Promise<Object>} Result with success boolean and optional message
   */
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        toast.success('Account created successfully');
        return { success: true };
      } else {
        toast.error('Registration failed: Invalid response from server');
        return { success: false, message: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  /**
   * Logs out the current user and clears their session.
   * Clears user state and cart data.
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

