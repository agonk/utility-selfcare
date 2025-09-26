import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  Download,
  Zap,
  Home,
  Users,
  Target
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { formatCurrency, formatNumber } from '../ui/utils'

// Mock analytics data
const monthlyData = [
  { month: 'Jan', consumption: 2800, cost: 175.50, target: 3000 },
  { month: 'Feb', consumption: 2650, cost: 166.25, target: 3000 },
  { month: 'Mar', consumption: 2950, cost: 185.15, target: 3000 },
  { month: 'Apr', consumption: 2100, cost: 131.80, target: 2500 },
  { month: 'May', consumption: 1850, cost: 116.10, target: 2500 },
  { month: 'Jun', consumption: 1620, cost: 101.75, target: 2500 },
  { month: 'Jul', consumption: 1450, cost: 91.05, target: 2000 },
  { month: 'Aug', consumption: 1380, cost: 86.70, target: 2000 },
  { month: 'Sep', consumption: 1980, cost: 124.35, target: 2500 },
  { month: 'Oct', consumption: 2650, cost: 166.25, target: 3000 },
  { month: 'Nov', consumption: 2890, cost: 181.35, target: 3000 },
  { month: 'Dec', consumption: 3420, cost: 214.75, target: 3000 }
]

const dailyData = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  consumption: Math.floor(Math.random() * 60) + 80,
  temperature: Math.floor(Math.random() * 15) + 5
}))

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  consumption: Math.floor(Math.random() * 30) + (i >= 6 && i <= 22 ? 40 : 20)
}))

const comparisonData = [
  { category: 'Your Home', consumption: 3420, color: '#97c50a' },
  { category: 'Similar Homes', consumption: 2850, color: '#84b300' },
  { category: 'Regional Average', consumption: 3100, color: '#f59e0b' },
  { category: 'Efficient Homes', consumption: 2200, color: '#8b5cf6' }
]

const peakOffPeakData = [
  { name: 'Peak Hours', value: 65, color: '#ef4444' },
  { name: 'Off-Peak Hours', value: 35, color: '#97c50a' }
]

export const ConsumptionAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12months')
  const [selectedView, setSelectedView] = useState('consumption')





  const calculateTrend = () => {
    const current = monthlyData[monthlyData.length - 1].consumption
    const previous = monthlyData[monthlyData.length - 2].consumption
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : 'down'
    }
  }

  const trend = calculateTrend()

  const yearlyTotal = monthlyData.reduce((sum, month) => sum + month.consumption, 0)
  const yearlyAverage = Math.round(yearlyTotal / 12)
  const dailyAverage = Math.round(monthlyData[monthlyData.length - 1].consumption / 31)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consumption Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track and analyze your energy usage patterns
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="thisyear">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,420 kWh</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              {trend.value.toFixed(1)}% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyAverage} kWh</div>
            <p className="text-xs text-muted-foreground">
              Based on this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(yearlyTotal)} kWh</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(yearlyAverage)} kWh monthly avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">78%</div>
            <p className="text-xs text-muted-foreground">
              Above regional average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Consumption Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Consumption</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={selectedView === 'consumption' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView('consumption')}
                >
                  Consumption
                </Button>
                <Button
                  variant={selectedView === 'cost' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView('cost')}
                >
                  Cost
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {selectedView === 'consumption' ? (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${formatNumber(value as number)} kWh`, 
                      name === 'consumption' ? 'Consumption' : 'Target'
                    ]}
                  />
                  <Bar dataKey="consumption" fill="#97c50a" radius={[4, 4, 0, 0]} />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </BarChart>
              ) : (
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), 'Cost']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#97c50a" 
                    fill="#97c50a" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Usage Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kWh`, 'Consumption']} />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#97c50a" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kWh`, 'Hourly Usage']} />
                <Bar dataKey="consumption" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Regional Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparisonData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{formatNumber(item.consumption)} kWh</span>
                    {item.category === 'Your Home' && (
                      <Badge variant="secondary">You</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                You're using 20% more than similar homes in your area. 
                Consider energy-saving measures to reduce consumption.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Peak vs Off-Peak */}
        <Card>
          <CardHeader>
            <CardTitle>Peak vs Off-Peak Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={peakOffPeakData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {peakOffPeakData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {peakOffPeakData.map((item, index) => (
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

            <div className="mt-4 bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                💡 Try shifting some activities to off-peak hours (11 PM - 7 AM) 
                to reduce costs by up to 15%.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-900">Usage Alert</h4>
              </div>
              <p className="text-sm text-yellow-800">
                Your consumption is 18% higher than last month. Peak usage occurs between 7-9 PM.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Home className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Efficiency Tip</h4>
              </div>
              <p className="text-sm text-blue-800">
                Lowering your thermostat by 2°C could save you approximately €25 this month.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">Goal Progress</h4>
              </div>
              <p className="text-sm text-green-800">
                You're 14% above your monthly target. Reduce daily usage by 50 kWh to meet your goal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}