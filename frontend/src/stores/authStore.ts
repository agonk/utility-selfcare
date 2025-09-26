import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  heatmeterId?: string
  locale: 'sq' | 'en'
  role: 'user' | 'admin'
  verified: boolean
  createdAt: string
}

export interface LoginCredentials {
  method: 'email' | 'heatmeter' | 'google' | 'microsoft'
  identifier: string
  password?: string
  oauthToken?: string
  rememberMe?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Impersonation state
  originalUser: User | null
  impersonatedUser: User | null
  isImpersonating: boolean
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (data: any) => Promise<void>
  refreshToken: () => Promise<boolean>
  clearError: () => void
  setUser: (user: User) => void
  startImpersonation: (targetUser: User) => void
  stopImpersonation: () => void
}

// Mock API functions (in real app these would call your Laravel backend)
const mockLogin = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock different users based on credentials
  if (credentials.identifier === 'admin@example.com') {
    return {
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        fullName: 'System Administrator',
        phone: '+355691234567',
        heatmeterId: 'ADM001',
        locale: 'en',
        role: 'admin',
        verified: true,
        createdAt: '2024-01-01T00:00:00Z'
      },
      token: 'mock-admin-token'
    }
  }
  
  // Handle different mock users
  const mockUsers = {
    'arben.mehmeti@email.com': {
      id: 'user-1',
      email: 'arben.mehmeti@email.com',
      fullName: 'Arben Mehmeti',
      phone: '+355 69 123 4567',
      heatmeterId: 'HM123456',
      locale: 'sq' as const,
      role: 'user' as const,
      verified: true,
      createdAt: '2024-01-15T10:30:00Z'
    },
    'elida.kola@email.com': {
      id: 'user-2',
      email: 'elida.kola@email.com',
      fullName: 'Elida Kola',
      phone: '+355 68 987 6543',
      heatmeterId: 'HM789012',
      locale: 'sq' as const,
      role: 'user' as const,
      verified: true,
      createdAt: '2024-02-03T10:30:00Z'
    }
  }
  
  const user = mockUsers[credentials.identifier as keyof typeof mockUsers]
  
  if (user) {
    return { user, token: 'mock-user-token' }
  }
  
  // Default fallback user
  return {
    user: {
      id: 'user-default',
      email: credentials.identifier,
      fullName: 'Test User',
      phone: '+355691234567',
      heatmeterId: 'HM000000',
      locale: 'sq',
      role: 'user',
      verified: true,
      createdAt: '2024-01-15T10:30:00Z'
    },
    token: 'mock-user-token'
  }
}

const mockRegister = async (data: any): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    user: {
      id: 'new-user-' + Date.now(),
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      heatmeterId: data.heatmeterId,
      locale: data.locale || 'en',
      role: 'user',
      verified: false,
      createdAt: new Date().toISOString()
    },
    token: 'mock-new-user-token'
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Impersonation state
      originalUser: null,
      impersonatedUser: null,
      isImpersonating: false,
      
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await mockLogin(credentials)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({
            error: 'Invalid credentials. Please try again.',
            isLoading: false
          })
          throw error
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null,
          originalUser: null,
          impersonatedUser: null,
          isImpersonating: false
        })
      },
      
      register: async (data) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await mockRegister(data)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({
            error: 'Registration failed. Please try again.',
            isLoading: false
          })
          throw error
        }
      },
      
      refreshToken: async () => {
        try {
          // Mock refresh token logic
          await new Promise(resolve => setTimeout(resolve, 500))
          return true
        } catch {
          get().logout()
          return false
        }
      },
      
      clearError: () => {
        set({ error: null })
      },
      
      setUser: (user) => {
        set({ user })
      },
      
      startImpersonation: (targetUser) => {
        const currentState = get()
        if (currentState.user?.role === 'admin') {
          set({
            originalUser: currentState.user,
            impersonatedUser: targetUser,
            user: targetUser, // Set the user to the impersonated user
            isImpersonating: true
          })
        }
      },
      
      stopImpersonation: () => {
        const currentState = get()
        if (currentState.isImpersonating && currentState.originalUser) {
          set({
            user: currentState.originalUser,
            originalUser: null,
            impersonatedUser: null,
            isImpersonating: false
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        originalUser: state.originalUser,
        impersonatedUser: state.impersonatedUser,
        isImpersonating: state.isImpersonating
      }),
    }
  )
)