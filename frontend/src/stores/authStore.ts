import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, User as ApiUser, apiService } from '../services/api'

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
  checkAuth: () => Promise<void>
}

// Convert API user to store user format
const convertApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.id.toString(),
  email: apiUser.email,
  fullName: apiUser.name,
  phone: apiUser.phone,
  heatmeterId: apiUser.heatmeter_id,
  locale: (apiUser.language || 'sq') as 'sq' | 'en',
  role: apiUser.is_admin ? 'admin' : 'user',
  verified: apiUser.is_verified,
  createdAt: apiUser.created_at
})

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
          // For now, only support email login method
          if (credentials.method !== 'email') {
            throw new Error('Only email login is currently supported')
          }

          const response = await authApi.login({
            email: credentials.identifier,
            password: credentials.password || '',
            remember: credentials.rememberMe
          })

          set({
            user: convertApiUser(response.user),
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials. Please try again.'
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            originalUser: null,
            impersonatedUser: null,
            isImpersonating: false
          })
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authApi.register({
            name: data.fullName,
            email: data.email,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
            phone: data.phone,
            language: data.locale
          })

          set({
            user: convertApiUser(response.user),
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.'
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken()
          set({
            token: response.token,
            user: convertApiUser(response.user)
          })
          return true
        } catch {
          get().logout()
          return false
        }
      },

      checkAuth: async () => {
        const token = get().token
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        try {
          apiService.setToken(token)
          const response = await authApi.getUser()
          set({
            user: convertApiUser(response.user),
            isAuthenticated: true
          })
        } catch (error) {
          console.error('Auth check failed:', error)
          set({
            isAuthenticated: false,
            user: null,
            token: null
          })
          apiService.setToken(null)
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
            user: targetUser,
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
      onRehydrateStorage: () => (state) => {
        // Set token in API service when rehydrating from storage
        if (state?.token) {
          apiService.setToken(state.token)
          // Check auth status on rehydration
          state.checkAuth()
        }
      }
    }
  )
)