import { useEffect } from 'react'
import { generateMockNotifications, useNotificationStore } from '../../stores/notificationStore'

export const NotificationInitializer: React.FC = () => {
  const { notifications, addNotification } = useNotificationStore()

  useEffect(() => {
    // Only generate mock data if no notifications exist
    if (notifications.length === 0) {
      generateMockNotifications()
      
      // Add a welcome notification
      addNotification({
        type: 'info',
        title: 'Welcome to Your Dashboard!',
        message: 'Your notification center is now active. Stay updated with important system messages.',
        read: false,
        priority: 'medium',
        category: 'general'
      })
    }
  }, [notifications.length, addNotification])

  // This component doesn't render anything
  return null
}