import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  User, 
  Mail, 
  Phone,
  Hash,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  Edit,
  Trash2,
  Download,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Checkbox } from '../ui/checkbox'
import { formatCurrency } from '../ui/utils'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'

// Mock user data
const mockUsers = [
  {
    id: '1',
    fullName: 'Arben Mehmeti',
    email: 'arben.mehmeti@email.com',
    phone: '+355 69 123 4567',
    heatmeterId: 'HM123456',
    status: 'active',
    verified: true,
    createdAt: '2024-01-15',
    lastLogin: '2024-12-28',
    totalPayments: 1250.80,
    role: 'user'
  },
  {
    id: '2',
    fullName: 'Elida Kola',
    email: 'elida.kola@email.com',
    phone: '+355 68 987 6543',
    heatmeterId: 'HM789012',
    status: 'active',
    verified: true,
    createdAt: '2024-02-03',
    lastLogin: '2024-12-27',
    totalPayments: 890.45,
    role: 'user'
  },
  {
    id: '3',
    fullName: 'Besnik Rama',
    email: 'besnik.rama@email.com',
    phone: '+355 67 456 7890',
    heatmeterId: 'HM345678',
    status: 'pending',
    verified: false,
    createdAt: '2024-12-20',
    lastLogin: '2024-12-25',
    totalPayments: 0,
    role: 'user'
  },
  {
    id: '4',
    fullName: 'Klara Berisha',
    email: 'klara.berisha@email.com',
    phone: '+355 69 234 5678',
    heatmeterId: 'HM567890',
    status: 'suspended',
    verified: true,
    createdAt: '2024-03-10',
    lastLogin: '2024-12-15',
    totalPayments: 567.30,
    role: 'user'
  },
  {
    id: '5',
    fullName: 'System Admin',
    email: 'admin@example.com',
    phone: '+355 69 000 0000',
    heatmeterId: 'ADM001',
    status: 'active',
    verified: true,
    createdAt: '2024-01-01',
    lastLogin: '2024-12-28',
    totalPayments: 0,
    role: 'admin'
  }
]

type UserStatus = 'all' | 'active' | 'pending' | 'suspended'
type UserRole = 'all' | 'user' | 'admin'

export const UserManagement: React.FC = () => {
  const navigate = useNavigate()
  const { startImpersonation } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all')
  const [roleFilter, setRoleFilter] = useState<UserRole>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.heatmeterId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-lime-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'suspended':
        return <Ban className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-lime-100 text-lime-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'user':
        return 'bg-lime-100 text-lime-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (typeof Intl !== 'undefined' && Intl.DateFormat) {
        return new Intl.DateFormat('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }).format(date)
      } else {
        // Fallback formatting
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
      }
    } catch (error) {
      return dateString
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAll = () => {
    setSelectedUsers(filteredUsers.map(user => user.id))
  }

  const clearSelection = () => {
    setSelectedUsers([])
  }

  const handleViewAsUser = (user: any) => {
    if (user.role === 'admin') {
      return // Don't allow viewing as another admin
    }
    
    const targetUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      heatmeterId: user.heatmeterId,
      locale: 'sq' as const,
      role: user.role as 'user' | 'admin',
      verified: user.verified,
      createdAt: user.createdAt
    }
    
    startImpersonation(targetUser)
    navigate('/dashboard')
    
    // Show success message
    setTimeout(() => {
      toast.success(`Now viewing as ${user.fullName}`)
    }, 100)
  }

  const summaryStats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    pending: mockUsers.filter(u => u.status === 'pending').length,
    suspended: mockUsers.filter(u => u.status === 'suspended').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <User className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{summaryStats.total}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.suspended}</p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or heatmeter ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: UserStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={(value: UserRole) => setRoleFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              {selectedUsers.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              )}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} selected
                </span>
                <Button variant="outline" size="sm">
                  Export Selected
                </Button>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found matching your criteria</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        {user.verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone}
                        </div>
                        <div className="flex items-center">
                          <Hash className="h-3 w-3 mr-1" />
                          {user.heatmeterId}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                        <span>Joined {formatDate(user.createdAt)}</span>
                        <span>Last login {formatDate(user.lastLogin)}</span>
                        <span>Total payments: {formatCurrency(user.totalPayments)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{user.status}</span>
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role === 'user' && (
                          <DropdownMenuItem onClick={() => handleViewAsUser(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View as User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {user.verified ? 'Unverify' : 'Verify'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ban className="mr-2 h-4 w-4" />
                          {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}