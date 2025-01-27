import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
  access_token: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', credentials);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        api.defaults.headers.Authorization = `Bearer ${response.data.access_token}`;
      }
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Using mock auth in development');
        const mockResponse = {
          user: {
            id: '1',
            name: 'Admin User',
            email: credentials.email,
            role: credentials.email.includes('admin') ? 'ADMIN' : 'USER'
          },
          access_token: 'mock-token'
        };
        localStorage.setItem('token', mockResponse.access_token);
        return mockResponse;
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/register', data);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        api.defaults.headers.Authorization = `Bearer ${response.data.access_token}`;
      }
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Using mock registration in development');
        const mockResponse = {
          user: {
            id: '1',
            name: data.name,
            email: data.email,
            role: 'USER'
          },
          access_token: 'mock-token'
        };
        localStorage.setItem('token', mockResponse.access_token);
        return mockResponse;
      }
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Using mock profile in development');
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        return {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN'
        };
      }
      throw error;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();