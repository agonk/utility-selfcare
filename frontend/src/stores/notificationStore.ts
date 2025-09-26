import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Helper function to ensure dates are properly converted
const ensureDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date
  }
  return new Date(date)
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  title: string
  message: string
  timestamp: Date | string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionUrl?: string
  actionLabel?: string
  persistent?: boolean // For system-wide notifications that stay until dismissed
  category?: 'billing' | 'system' | 'security' | 'general'
}

export interface SystemNotification {
  id: string
  type: 'maintenance' | 'outage' | 'update' | 'security' | 'billing'
  title: string
  message: string
  startTime: Date | string
  endTime?: Date | string
  severity: 'info' | 'warning' | 'critical'
  dismissible: boolean
  showOnPages?: string[] // If specified, only show on these pages
}

interface NotificationState {
  notifications: Notification[]
  systemNotifications: SystemNotification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  
  // System notifications
  addSystemNotification: (notification: Omit<SystemNotification, 'id'>) => void
  dismissSystemNotification: (id: string) => void
  
  // Getters
  getUnreadNotifications: () => Notification[]
  getNotificationsByCategory: (category: string) => Notification[]
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      systemNotifications: [
        // Mock system notifications
        {
          id: 'maintenance_2024_01',
          type: 'maintenance',
          title: 'Scheduled Maintenance',
          message: 'System maintenance scheduled for tonight 2:00 AM - 4:00 AM. Some services may be temporarily unavailable.',
          startTime: new Date('2024-01-20T02:00:00'),
          endTime: new Date('2024-01-20T04:00:00'),
          severity: 'warning',
          dismissible: true
        },
        {
          id: 'security_update_2024',
          type: 'security',
          title: 'Security Update Required',
          message: 'Please update your password to comply with new security requirements.',
          startTime: new Date(),
          severity: 'critical',
          dismissible: false,
          showOnPages: ['/dashboard', '/profile']
        }
      ],
      unreadCount: 0,

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        }

        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
          const unreadCount = notifications.filter((n) => !n.read).length
          return { notifications, unreadCount }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
          unreadCount: 0,
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const notifications = state.notifications.filter((notif) => notif.id !== id)
          const unreadCount = notification && !notification.read 
            ? state.unreadCount - 1 
            : state.unreadCount
          return { notifications, unreadCount }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      addSystemNotification: (notificationData) => {
        const systemNotification: SystemNotification = {
          ...notificationData,
          id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }

        set((state) => ({
          systemNotifications: [systemNotification, ...state.systemNotifications],
        }))
      },

      dismissSystemNotification: (id) => {
        set((state) => ({
          systemNotifications: state.systemNotifications.filter((notif) => notif.id !== id),
        }))
      },

      getUnreadNotifications: () => {
        return get().notifications.filter((notif) => !notif.read)
      },

      getNotificationsByCategory: (category) => {
        return get().notifications.filter((notif) => notif.category === category)
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications,
        systemNotifications: state.systemNotifications,
        unreadCount: state.unreadCount,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert string dates back to Date objects
          state.notifications = state.notifications.map(notification => ({
            ...notification,
            timestamp: ensureDate(notification.timestamp)
          }))
          
          state.systemNotifications = state.systemNotifications.map(notification => ({
            ...notification,
            startTime: ensureDate(notification.startTime),
            endTime: notification.endTime ? ensureDate(notification.endTime) : undefined
          }))
        }
      },
    }
  )
)

// Mock data generator for demo purposes
export const generateMockNotifications = () => {
  const { addNotification } = useNotificationStore.getState()
  
  const mockNotifications = [
    {
      type: 'success' as const,
      title: 'Payment Successful',
      message: 'Your payment of €125.50 has been processed successfully.',
      read: false,
      priority: 'medium' as const,
      category: 'billing' as const,
    },
    {
      type: 'warning' as const,
      title: 'Bill Due Soon',
      message: 'Your electricity bill of €89.30 is due in 3 days.',
      read: false,
      priority: 'high' as const,
      category: 'billing' as const,
      actionUrl: '/invoices',
      actionLabel: 'View Bill'
    },
    {
      type: 'info' as const,
      title: 'Monthly Usage Report',
      message: 'Your consumption report for December is now available.',
      read: true,
      priority: 'low' as const,
      category: 'general' as const,
      actionUrl: '/consumption',
      actionLabel: 'View Report'
    },
    {
      type: 'system' as const,
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      read: false,
      priority: 'low' as const,
      category: 'general' as const,
    },
    {
      type: 'error' as const,
      title: 'Payment Failed',
      message: 'Your recent payment attempt was declined. Please try again.',
      read: false,
      priority: 'critical' as const,
      category: 'billing' as const,
      actionUrl: '/payments',
      actionLabel: 'Retry Payment'
    }
  ]

  mockNotifications.forEach((notif) => {
    addNotification(notif)
  })
}