import React from 'react'
import { useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  Info,
  X,
  Clock,
  Shield,
  Wrench,
  Zap,
  CreditCard
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useNotificationStore, type SystemNotification } from '../../stores/notificationStore'
import { formatDistanceToNow, isAfter, isBefore } from '../../utils/dateUtils'

export const SystemNotificationBar: React.FC = () => {
  const location = useLocation()
  const { systemNotifications, dismissSystemNotification } = useNotificationStore()

  const getNotificationIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="h-4 w-4" />
      case 'outage':
        return <Zap className="h-4 w-4" />
      case 'update':
        return <Info className="h-4 w-4" />
      case 'security':
        return <Shield className="h-4 w-4" />
      case 'billing':
        return <CreditCard className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityStyles = (severity: SystemNotification['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white border-red-700'
      case 'warning':
        return 'bg-yellow-500 text-yellow-900 border-yellow-600'
      case 'info':
        return 'bg-blue-500 text-white border-blue-600'
      default:
        return 'bg-gray-500 text-white border-gray-600'
    }
  }

  const getTimeStatus = (notification: SystemNotification) => {
    const now = new Date()
    
    if (notification.endTime && isAfter(now, notification.endTime)) {
      return 'ended'
    }
    
    if (isBefore(now, notification.startTime)) {
      return 'scheduled'
    }
    
    return 'active'
  }

  const formatTimeInfo = (notification: SystemNotification) => {
    const status = getTimeStatus(notification)
    
    switch (status) {
      case 'scheduled':
        return `Starts ${formatDistanceToNow(notification.startTime, { addSuffix: true })}`
      case 'active':
        if (notification.endTime) {
          return `Ends ${formatDistanceToNow(notification.endTime, { addSuffix: true })}`
        }
        return 'Active now'
      case 'ended':
        return 'Completed'
      default:
        return ''
    }
  }

  // Filter notifications that should be shown on current page
  const visibleNotifications = systemNotifications.filter(notification => {
    const status = getTimeStatus(notification)
    
    // Don't show ended notifications
    if (status === 'ended') return false
    
    // If showOnPages is specified, only show on those pages
    if (notification.showOnPages) {
      return notification.showOnPages.includes(location.pathname)
    }
    
    // Otherwise show on all pages
    return true
  })

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      {visibleNotifications.map((notification) => {
        const timeStatus = getTimeStatus(notification)
        const severityStyles = getSeverityStyles(notification.severity)
        
        return (
          <div
            key={notification.id}
            className={`
              relative px-4 py-3 border-b transition-all duration-300
              ${severityStyles}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-sm">
                      {notification.title}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      {timeStatus === 'scheduled' && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-white/20 border-white/30 text-white"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Scheduled
                        </Badge>
                      )}
                      
                      {timeStatus === 'active' && notification.severity === 'critical' && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-white/20 border-white/30 text-white animate-pulse"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-90 mb-1">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs opacity-75">
                    <span>
                      {formatTimeInfo(notification)}
                    </span>
                    
                    {notification.type === 'maintenance' && timeStatus === 'active' && (
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-current rounded-full mr-1 animate-pulse"></div>
                        Maintenance in progress
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {notification.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissSystemNotification(notification.id)}
                  className="flex-shrink-0 text-current hover:bg-white/20 p-1 h-8 w-8"
                  title="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Progress bar for time-based notifications */}
            {notification.endTime && timeStatus === 'active' && (
              <div className="mt-3">
                <div className="w-full bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-white rounded-full h-1 transition-all duration-1000"
                    style={{
                      width: `${Math.max(0, Math.min(100, 
                        ((Date.now() - new Date(notification.startTime).getTime()) / 
                         (new Date(notification.endTime).getTime() - new Date(notification.startTime).getTime())) * 100
                      ))}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}