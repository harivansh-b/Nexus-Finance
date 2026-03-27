import { create } from 'zustand';
import apiClient from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Initialize auth from localStorage
  initAuth: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({ user: JSON.parse(user), isAuthenticated: true });
    }
  },

  // Register
  register: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        username,
      });
      const { user, token } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      const message = error.message || 'Registration failed';
      set({ error: message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      const message = error.message || 'Login failed';
      set({ error: message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  // Update user
  updateUser: (user) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clerk login handler
  handleClerkAuth: (user, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
}));
