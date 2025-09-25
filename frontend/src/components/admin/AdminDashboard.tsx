import React from 'react'
import { 
  Users, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Server,
  Globe
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { formatCurrency, formatNumber } from '../ui/utils'

// Mock admin data
const mockAdminData = {
  metrics: {
    totalUsers: 1234,
    activeUsers: 892,
    newUsersToday: 23,
    pendingVerifications: 15,
    totalPayments: 245800,
    failedPayments: 12,
    systemUptime: 99.9,
    avgResponseTime: 245
  },
  userGrowth: [
    { month: 'Jan', users: 850, active: 680 },
    { month: 'Feb', users: 920, active: 750 },
    { month: 'Mar', users: 1050, active: 820 },
    { month: 'Apr', users: 1150, active: 890 },
    { month: 'May', users: 1200, active: 920 },
    { month: 'Jun', users: 1234, active: 892 }
  ],
  paymentVolume: [
    { day: 'Mon', amount: 42500 },
    { day: 'Tue', amount: 38200 },
    { day: 'Wed', amount: 51200 },
    { day: 'Thu', amount: 45800 },
    { day: 'Fri', amount: 48300 },
    { day: 'Sat', amount: 35400 },
    { day: 'Sun', amount: 29100 }
  ],
  verificationStatus: [
    { name: 'Verified', value: 85, color: '#97c50a' },
    { name: 'Pending', value: 12, color: '#f59e0b' },
    { name: 'Rejected', value: 3, color: '#ef4444' }
  ],
  recentActivity: [
    {
      id: 1,
      type: 'user_registration',
      user: 'Arben Mehmeti',
      action: 'registered new account',
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'payment',
      user: 'Elida Kola',
      action: 'completed payment of €180.50',
      time: '12 minutes ago'
    },
    {
      id: 3,
      type: 'verification',
      user: 'Besnik Rama',
      action: 'submitted verification documents',
      time: '23 minutes ago'
    },
    {
      id: 4,
      type: 'system',
      user: 'System',
      action: 'automated backup completed',
      time: '1 hour ago'
    },
    {
      id: 5,
      type: 'payment_failed',
      user: 'Klara Berisha',
      action: 'payment failed - insufficient funds',
      time: '2 hours ago'
    }
  ],
  systemStatus: {
    api: 'operational',
    database: 'operational', 
    payments: 'operational',
    notifications: 'degraded'
  }
}

export const AdminDashboard: React.FC = () => {
  const data = mockAdminData



  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4 text-lime-600" />
      case 'payment':
        return <CreditCard className="h-4 w-4 text-lime-600" />
      case 'verification':
        return <CheckCircle2 className="h-4 w-4 text-yellow-600" />
      case 'payment_failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-lime-100 text-lime-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      case 'down':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            System overview and management tools
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            System Status
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics.totalUsers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-lime-500 mr-1" />
              +{data.metrics.newUsersToday} today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.metrics.activeUsers / data.metrics.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.metrics.totalPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lime-600">
              {data.metrics.systemUptime}%
            </div>
            <p className="text-xs text-muted-foreground">
              30-day average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-900">
                  {data.metrics.pendingVerifications} Pending Verifications
                </p>
                <p className="text-sm text-yellow-700">
                  User accounts awaiting manual review
                </p>
              </div>
              <Button size="sm" className="ml-auto">
                Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-900">
                  {data.metrics.failedPayments} Failed Payments
                </p>
                <p className="text-sm text-red-700">
                  Payments requiring attention today
                </p>
              </div>
              <Button size="sm" variant="destructive" className="ml-auto">
                Investigate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1" 
                  stroke="#97c50a" 
                  fill="#97c50a" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stackId="2" 
                  stroke="#84b300" 
                  fill="#84b300" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Payment Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.paymentVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Amount']}
                />
                <Bar dataKey="amount" fill="#97c50a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status & Verification Stats */}
        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(data.systemStatus).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {service.replace('_', ' ')}
                  </span>
                  <Badge className={getStatusColor(status)}>
                    {status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={data.verificationStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.verificationStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  {data.verificationStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Process Verifications
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Globe className="h-4 w-4 mr-2" />
                Translation Editor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}