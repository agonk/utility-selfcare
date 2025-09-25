import React, { useState } from 'react'
import { 
  FileText, 
  Filter, 
  Search, 
  Download,
  Eye,
  User,
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { DateRangePicker } from '../ui/date-range-picker'

// Mock audit log data
const mockAuditLogs = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    userId: 'admin_001',
    userName: 'John Admin',
    userEmail: 'admin@example.com',
    action: 'USER_CREATED',
    resource: 'User Management',
    details: 'Created new user: jane.doe@example.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'info',
    status: 'success'
  },
  {
    id: '2',
    timestamp: '2024-01-15T09:45:00Z',
    userId: 'admin_002',
    userName: 'Sarah Admin',
    userEmail: 'sarah@example.com',
    action: 'SETTINGS_UPDATED',
    resource: 'System Settings',
    details: 'Updated billing configuration: Tax rate changed from 18% to 20%',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    severity: 'warning',
    status: 'success'
  },
  {
    id: '3',
    timestamp: '2024-01-15T08:20:00Z',
    userId: 'user_123',
    userName: 'Bob User',
    userEmail: 'bob@example.com',
    action: 'LOGIN_FAILED',
    resource: 'Authentication',
    details: 'Failed login attempt - Invalid password',
    ipAddress: '203.0.113.50',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    severity: 'error',
    status: 'failed'
  },
  {
    id: '4',
    timestamp: '2024-01-15T07:15:00Z',
    userId: 'admin_001',
    userName: 'John Admin',
    userEmail: 'admin@example.com',
    action: 'INVOICE_APPROVED',
    resource: 'Invoice Management',
    details: 'Approved invoice INV-2024-001 for customer ID: 456',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'info',
    status: 'success'
  },
  {
    id: '5',
    timestamp: '2024-01-14T16:30:00Z',
    userId: 'system',
    userName: 'System',
    userEmail: 'system@internal',
    action: 'BACKUP_COMPLETED',
    resource: 'System Backup',
    details: 'Daily backup completed successfully - Size: 2.3GB',
    ipAddress: '127.0.0.1',
    userAgent: 'System Process',
    severity: 'info',
    status: 'success'
  },
  {
    id: '6',
    timestamp: '2024-01-14T15:45:00Z',
    userId: 'admin_002',
    userName: 'Sarah Admin',
    userEmail: 'sarah@example.com',
    action: 'USER_PERMISSION_CHANGED',
    resource: 'User Management',
    details: 'Updated permissions for user: jane.doe@example.com - Added admin role',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    severity: 'warning',
    status: 'success'
  }
]

const actionTypes = [
  'USER_CREATED',
  'USER_UPDATED', 
  'USER_DELETED',
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'SETTINGS_UPDATED',
  'INVOICE_APPROVED',
  'INVOICE_REJECTED',
  'BACKUP_COMPLETED',
  'USER_PERMISSION_CHANGED'
]

const severityTypes = ['info', 'warning', 'error']

export const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [dateRange, setDateRange] = useState<any>(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-lime-100 text-lime-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <Activity className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return <User className="h-4 w-4" />
    if (action.includes('LOGIN')) return <Shield className="h-4 w-4" />
    if (action.includes('SETTINGS')) return <FileText className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter
    const matchesUser = userFilter === 'all' || log.userId === userFilter
    
    return matchesSearch && matchesAction && matchesSeverity && matchesUser
  })

  const stats = {
    total: mockAuditLogs.length,
    today: mockAuditLogs.filter(log => {
      const today = new Date().toDateString()
      return new Date(log.timestamp).toDateString() === today
    }).length,
    warnings: mockAuditLogs.filter(log => log.severity === 'warning').length,
    errors: mockAuditLogs.filter(log => log.severity === 'error').length
  }

  const uniqueUsers = [...new Set(mockAuditLogs.map(log => ({ id: log.userId, name: log.userName })))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor system activities and user actions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.today}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {severityTypes.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {formatRelativeTime(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {log.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {log.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.userEmail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className="ml-2 text-sm">{log.action.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.resource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getSeverityColor(log.severity)} border-0`}>
                      {getSeverityIcon(log.severity)}
                      <span className="ml-1 capitalize">{log.severity}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {log.ipAddress}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                          <DialogDescription>
                            Detailed information about this activity
                          </DialogDescription>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">Timestamp</label>
                                <p className="text-sm text-gray-900">
                                  {new Date(selectedLog.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">User</label>
                                <p className="text-sm text-gray-900">{selectedLog.userName}</p>
                                <p className="text-xs text-gray-500">{selectedLog.userEmail}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Action</label>
                                <p className="text-sm text-gray-900">{selectedLog.action}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Resource</label>
                                <p className="text-sm text-gray-900">{selectedLog.resource}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Severity</label>
                                <Badge className={`${getSeverityColor(selectedLog.severity)} border-0 mt-1`}>
                                  {getSeverityIcon(selectedLog.severity)}
                                  <span className="ml-1 capitalize">{selectedLog.severity}</span>
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <p className="text-sm text-gray-900 capitalize">{selectedLog.status}</p>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-600">Details</label>
                              <p className="text-sm text-gray-900 mt-1">{selectedLog.details}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-600">IP Address</label>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded ml-2">
                                {selectedLog.ipAddress}
                              </code>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-600">User Agent</label>
                              <p className="text-xs text-gray-600 mt-1 break-all">
                                {selectedLog.userAgent}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}