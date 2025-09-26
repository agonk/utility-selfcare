import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Components
import { LoadingSpinner } from './components/LoadingSpinner'
import { LandingPage } from './components/LandingPage'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterFlow } from './components/auth/RegisterFlow'
import { ProtectedLayout } from './components/layout/ProtectedLayout'
import { Dashboard } from './components/dashboard/Dashboard'
import { InvoicesPage } from './components/invoices/InvoicesPage'
import { InvoiceDetail } from './components/invoices/InvoiceDetail'
import { ConsumptionAnalytics } from './components/analytics/ConsumptionAnalytics'
import { PaymentsPage } from './components/payments/PaymentsPage'
import { PaymentFlow } from './components/payments/PaymentFlow'
import { ProfileSettings } from './components/profile/ProfileSettings'
import { NotificationsPage } from './components/notifications/NotificationsPage'
import { NotificationInitializer } from './components/notifications/NotificationInitializer'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { UserManagement } from './components/admin/UserManagement'
import { Verifications } from './components/admin/Verifications'
import { Translations } from './components/admin/Translations'
import { SystemSettings } from './components/admin/SystemSettings'
import { AuditLogs } from './components/admin/AuditLogs'

// Stores
import { useAuthStore } from './stores/authStore'

// Configure TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isImpersonating, originalUser } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Allow access if user is a regular user, or if admin is impersonating
  if (user?.role === 'user' || (isImpersonating && originalUser?.role === 'admin')) {
    return <>{children}</>
  }
  
  // If admin is not impersonating, redirect to admin panel
  if (user?.role === 'admin' && !isImpersonating) {
    return <Navigate to="/admin" replace />
  }
  
  return <>{children}</>
}

// Admin Route wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isImpersonating, originalUser } = useAuthStore()
  
  // Check if user is actually an admin (either direct admin or impersonating admin)
  const isActualAdmin = originalUser?.role === 'admin' || (user?.role === 'admin' && !isImpersonating)
  
  if (!isAuthenticated || !isActualAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<LoadingSpinner />}>
              <NotificationInitializer />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterFlow />} />
              
              {/* Protected user routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <InvoicesPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoices/:id" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <InvoiceDetail />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/consumption" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ConsumptionAnalytics />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/payments" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <PaymentsPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/payment/process" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <PaymentFlow />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ProfileSettings />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <NotificationsPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              } />
              
              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </AdminRoute>
              } />
              
              <Route path="/admin/verifications" element={
                <AdminRoute>
                  <AdminLayout>
                    <Verifications />
                  </AdminLayout>
                </AdminRoute>
              } />
              
              <Route path="/admin/translations" element={
                <AdminRoute>
                  <AdminLayout>
                    <Translations />
                  </AdminLayout>
                </AdminRoute>
              } />
              
              <Route path="/admin/settings" element={
                <AdminRoute>
                  <AdminLayout>
                    <SystemSettings />
                  </AdminLayout>
                </AdminRoute>
              } />
              
              <Route path="/admin/logs" element={
                <AdminRoute>
                  <AdminLayout>
                    <AuditLogs />
                  </AdminLayout>
                </AdminRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}