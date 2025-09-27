const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
      }
      throw new Error(data?.message || 'An error occurred');
    }

    return data;
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  customer_id?: string;
  is_verified: boolean;
  verification_type?: 'otp' | 'invoice' | 'pending';
  language: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export const authApi = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    language?: string;
  }): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/register', data);
    if (response.token) {
      apiService.setToken(response.token);
    }
    return response;
  },

  async login(data: {
    email: string;
    password: string;
    remember?: boolean;
  }): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/login', data);
    if (response.token) {
      apiService.setToken(response.token);
    }
    return response;
  },

  async logout(): Promise<void> {
    await apiService.post('/logout');
    apiService.setToken(null);
  },

  async getUser(): Promise<{ user: User }> {
    return apiService.get('/user');
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/refresh');
    if (response.token) {
      apiService.setToken(response.token);
    }
    return response;
  },

  async updateProfile(data: {
    name?: string;
    phone?: string;
    customer_id?: string;
    language?: string;
  }): Promise<{ user: User; message: string }> {
    return apiService.put('/user', data);
  },
};