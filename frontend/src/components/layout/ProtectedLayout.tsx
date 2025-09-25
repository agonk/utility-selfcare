import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  BarChart3, 
  CreditCard, 
  User, 
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { useAuthStore } from '../../stores/authStore'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { SystemNotificationBar } from '../notifications/SystemNotificationBar'
import { ImpersonationBanner } from '../admin/ImpersonationBanner'
import { Logo } from '../ui/logo'
import { toast } from 'sonner'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Analytics', href: '/consumption', icon: BarChart3 },
  { name: 'Payments', href: '/payments', icon: CreditCard },
]

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Remember sidebar state in localStorage
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isImpersonating, originalUser } = useAuthStore()

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </div>
        )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:relative lg:shadow-none border-r border-gray-200 flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-16 w-16' : 'lg:w-64 w-64'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <Logo 
              width={sidebarCollapsed ? 40 : 160} 
              height={sidebarCollapsed ? 40 : 50} 
              className="flex-shrink-0" 
              collapsed={sidebarCollapsed}
            />
          </div>
          <div className="flex items-center space-x-1">
            {/* Desktop toggle button */}
            <button
              className="hidden lg:flex p-1 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {/* Mobile close button */}
            <button
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {/* Only show navigation for regular users or when admin is impersonating */}
          {(user?.role !== 'admin' || isImpersonating) && navigation.map((item) => {
            const isActive = location.pathname === item.href
            const navItem = (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative
                  ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-3'}
                  ${isActive 
                    ? 'bg-gradient-to-r from-lime-50 to-lime-100 text-lime-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`h-5 w-5 transition-colors flex-shrink-0 ${
                  isActive ? 'text-lime-600' : 'text-gray-400 group-hover:text-gray-500'
                } ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && (
                  <>
                    <span className={`transition-opacity duration-300 ${isActive ? 'font-semibold' : ''}`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-lime-600 rounded-full"></div>
                    )}
                  </>
                )}
                {sidebarCollapsed && isActive && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-lime-600 rounded-full"></div>
                )}
              </Link>
            )

            // Wrap with tooltip when collapsed
            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {navItem}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return navItem
          })}
        </nav>

        {/* User info in sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50/50">
          <div className={`flex items-center rounded-xl bg-white shadow-sm border border-gray-100 transition-all duration-300 ${
            sidebarCollapsed ? 'p-2 justify-center' : 'p-3'
          }`}>
            <Avatar className="h-10 w-10 ring-2 ring-lime-100 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-r from-lime-100 to-lime-200 text-lime-700 font-semibold">
                {user ? getInitials(user.fullName) : 'U'}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="ml-3 flex-1 min-w-0 transition-opacity duration-300">
                {user?.role === 'admin' && !isImpersonating ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-orange-600 truncate">
                      Admin - Use "View as User"
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* Desktop sidebar toggle */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              {/* Breadcrumb for larger screens */}
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {location.pathname.split('/')[1] || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <NotificationCenter />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-blue-100 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold">
                        {user ? getInitials(user.fullName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Only show user-specific menu items if user is not an admin, or if admin is impersonating */}
                  {(user?.role !== 'admin' || isImpersonating) && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Preferences
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {(user?.role === 'admin' && !isImpersonating) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {isImpersonating && originalUser?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Return to Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* System Notification Bar */}
        <SystemNotificationBar />
        
        {/* Impersonation Banner */}
        <ImpersonationBanner />

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {user?.role === 'admin' && !isImpersonating ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Admin Dashboard
                  </h3>
                  <p className="text-gray-600 mb-4">
                    As an administrator, you don't have personal utility data. To access user features, please use the "View as User" option from the Admin Panel.
                  </p>
                  <Link 
                    to="/admin" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Go to Admin Panel
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
    </TooltipProvider>
  )
}