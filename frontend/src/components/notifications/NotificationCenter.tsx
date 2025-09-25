import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  X,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  Settings,
  Filter
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '../ui/dropdown-menu'
import { ScrollArea } from '../ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { useNotificationStore, type Notification } from '../../stores/notificationStore'
import { formatDistanceToNow } from '../../utils/dateUtils'

export const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all')
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getUnreadNotifications,
    getNotificationsByCategory
  } = useNotificationStore()

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 border-red-200'
      case 'high':
        return 'bg-orange-100 border-orange-200'
      case 'medium':
        return 'bg-blue-100 border-blue-200'
      case 'low':
        return 'bg-gray-100 border-gray-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return getUnreadNotifications()
      case 'billing':
        return getNotificationsByCategory('billing')
      case 'system':
        return getNotificationsByCategory('system')
      default:
        return notifications
    }
  }

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    markAsRead(id)
  }

  const handleRemoveNotification = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeNotification(id)
  }

  const filteredNotifications = getFilteredNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 hover:bg-gray-100 rounded-full"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white border-0 flex items-center justify-center p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
              <TabsTrigger value="billing" className="text-xs">Billing</TabsTrigger>
              <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-2">
            <ScrollArea className="h-96">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-1">No notifications</p>
                  <p className="text-xs text-gray-400">
                    {activeTab === 'unread' 
                      ? "You're all caught up!" 
                      : `No ${activeTab === 'all' ? '' : activeTab} notifications`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group
                        ${!notification.read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''}
                        ${getPriorityColor(notification.priority)}
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  className="p-1 h-6 w-6"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleRemoveNotification(notification.id, e)}
                                className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                                title="Remove notification"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </span>
                            
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                onClick={() => markAsRead(notification.id)}
                              >
                                {notification.actionLabel || 'View'}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Priority indicator */}
                      {notification.priority === 'critical' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Link
              to="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}