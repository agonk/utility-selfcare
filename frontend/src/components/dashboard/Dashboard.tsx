import React from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Zap, 
  Calendar,
  ArrowRight,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Home,
  Target
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
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
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { formatDate, formatCurrency, formatNumber } from '../ui/utils'
import { useAuthStore } from '../../stores/authStore'
import { DashboardCharts } from './DashboardCharts'

// Mock data - in real app this would come from your backend
const mockDashboardData = {
  currentBalance: 245.80,
  monthlyConsumption: 3420, // kWh
  lastPayment: {
    amount: 180.50,
    date: '2024-12-15'
  },
  nextInvoiceDue: '2025-01-15',
  yearOverYear: 5.2, // percentage change
  recentInvoices: [
    {
      id: 'INV-2024-12',
      period: 'December 2024',
      amount: 245.80,
      status: 'unpaid' as const,
      dueDate: '2025-01-15'
    },
    {
      id: 'INV-2024-11',
      period: 'November 2024',
      amount: 180.50,
      status: 'paid' as const,
      paidDate: '2024-12-15'
    },
    {
      id: 'INV-2024-10',
      period: 'October 2024',
      amount: 165.20,
      status: 'paid' as const,
      paidDate: '2024-11-14'
    }
  ],
  monthlyTarget: 3000, // kWh target
  averageDaily: 110.3, // kWh per day
  peakUsageHour: '19:00',
  efficiencyScore: 78, // percentage
  weeklyConsumption: [
    { day: 'Mon', consumption: 95, cost: 14.25 },
    { day: 'Tue', consumption: 110, cost: 16.50 },
    { day: 'Wed', consumption: 125, cost: 18.75 },
    { day: 'Thu', consumption: 105, cost: 15.75 },
    { day: 'Fri', consumption: 140, cost: 21.00 },
    { day: 'Sat', consumption: 165, cost: 24.75 },
    { day: 'Sun', consumption: 135, cost: 20.25 }
  ],
  monthlyTrend: [
    { month: 'Aug', consumption: 2650 },
    { month: 'Sep', consumption: 2450 },
    { month: 'Oct', consumption: 2890 },
    { month: 'Nov', consumption: 3150 },
    { month: 'Dec', consumption: 3420 }
  ],
  consumptionBreakdown: [
    { category: 'Heating', value: 45, color: '#ef4444' },
    { category: 'Hot Water', value: 25, color: '#f59e0b' },
    { category: 'Appliances', value: 20, color: '#3b82f6' },
    { category: 'Lighting', value: 10, color: '#10b981' }
  ]
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const data = mockDashboardData

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }



  const consumptionProgress = (data.monthlyConsumption / data.monthlyTarget) * 100

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your energy overview for this month
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge variant="outline" className="text-sm">
            Heatmeter: {user?.heatmeterId || 'Not connected'}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Due {formatDate(data.nextInvoiceDue)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Consumption */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.monthlyConsumption)} kWh
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.yearOverYear > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              {Math.abs(data.yearOverYear)}% vs last year
            </div>
          </CardContent>
        </Card>

        {/* Last Payment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.lastPayment.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(data.lastPayment.date)}
            </p>
          </CardContent>
        </Card>

        {/* Efficiency Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.efficiencyScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Above regional average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/payment/process">
              <Button variant="default" className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-lime-600 hover:bg-lime-700 text-white">
                <CreditCard className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Pay Now</div>
                  <div className="text-xs opacity-90">
                    {formatCurrency(data.currentBalance)}
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/invoices">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">View Invoices</div>
                  <div className="text-xs text-muted-foreground">
                    {data.recentInvoices.filter(i => i.status === 'unpaid').length} unpaid
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/consumption">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Zap className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Usage Analytics</div>
                  <div className="text-xs text-muted-foreground">
                    {data.averageDaily} kWh/day avg
                  </div>
                </div>
              </Button>
            </Link>

            <Link to="/profile">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Calendar className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Profile</div>
                  <div className="text-xs text-muted-foreground">
                    Settings & Info
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Weekly Consumption Trend */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-lime-600" />
                Weekly Consumption
              </div>
              <Link to="/consumption">
                <Button variant="ghost" size="sm">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.weeklyConsumption}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'consumption' ? `${value} kWh` : formatCurrency(value as number),
                    name === 'consumption' ? 'Consumption' : 'Cost'
                  ]}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#97c50a" 
                  fill="#97c50a" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Usage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.consumptionBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.consumptionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, '']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {data.consumptionBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                Monthly Progress
              </div>
              <Link to="/consumption">
                <Button variant="ghost" size="sm">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Target: {formatNumber(data.monthlyTarget)} kWh
              </span>
              <span className="text-sm font-medium">
                {Math.round(consumptionProgress)}%
              </span>
            </div>
            
            <Progress 
              value={consumptionProgress} 
              className={`h-3 ${consumptionProgress > 100 ? 'bg-red-100' : 'bg-green-100'}`}
            />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-lime-50 p-3 rounded-lg">
                <p className="text-lime-600 text-xs uppercase tracking-wide">Daily Average</p>
                <p className="font-semibold text-lime-900">{data.averageDaily} kWh</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-purple-600 text-xs uppercase tracking-wide">Peak Hour</p>
                <p className="font-semibold text-purple-900">{data.peakUsageHour}</p>
              </div>
            </div>

            {consumptionProgress > 100 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  You've exceeded your monthly target. Consider energy-saving measures.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Recent Invoices
              </div>
              <Link to="/invoices">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium">{invoice.period}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.status === 'paid' 
                        ? `Paid on ${formatDate(invoice.paidDate!)}`
                        : `Due ${formatDate(invoice.dueDate)}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            5-Month Consumption Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value) => [`${formatNumber(value as number)} kWh`, 'Consumption']}
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="consumption" 
                stroke="#97c50a" 
                strokeWidth={3}
                dot={{ fill: '#97c50a', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#84b300' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Charts Section */}
      <DashboardCharts />

      {/* Tips & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="h-5 w-5 mr-2 text-lime-600" />
            Smart Energy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-lime-50 to-lime-100 p-4 rounded-xl border border-lime-200">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-lime-200 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-lime-700" />
                </div>
                <h4 className="font-semibold text-lime-900">Optimize Peak Hours</h4>
              </div>
              <p className="text-sm text-lime-800">
                Your peak usage is at {data.peakUsageHour}. Try shifting some activities to off-peak hours to save up to 15%.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-green-200 rounded-lg mr-3">
                  <Home className="h-5 w-5 text-green-700" />
                </div>
                <h4 className="font-semibold text-green-900">Smart Thermostat</h4>
              </div>
              <p className="text-sm text-green-800">
                Lower your thermostat by 1°C to save up to 8% on heating costs - approximately €18 this month.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-200 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-purple-700" />
                </div>
                <h4 className="font-semibold text-purple-900">Usage Trends</h4>
              </div>
              <p className="text-sm text-purple-800">
                You're using {Math.abs(data.yearOverYear)}% {data.yearOverYear > 0 ? 'more' : 'less'} than last year. 
                {data.yearOverYear > 0 ? ' Consider energy efficiency upgrades.' : ' Great job on reducing consumption!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}