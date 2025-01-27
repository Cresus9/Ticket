import axios from 'axios';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase-client';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    }

    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   'An unexpected error occurred';
    
    if (error.response.status === 401) {
      // Handle unauthorized access
      supabase.auth.signOut();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (!import.meta.env.DEV) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;