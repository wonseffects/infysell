import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error.response?.data?.message || 'Login failed';
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),

  updateOnboarding: async (step, complete = false) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.patch('/api/auth/onboarding', 
        { step, complete },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ user: data.user });
    } catch (error) {
      console.error('Failed to update onboarding', error);
    }
  }
}));

export default useAuthStore;
