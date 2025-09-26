import React, { useState } from 'react'
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
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Zap,
  Euro,
  BarChart3,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { formatCurrency, formatNumber } from '../ui/utils'

// Enhanced mock data for charts
const hourlyUsageData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  usage: Math.floor(Math.random() * 30) + (i >= 6 && i <= 22 ? 40 : 20),
  cost: (Math.floor(Math.random() * 30) + (i >= 6 && i <= 22 ? 40 : 20)) * 0.15
}))

const weeklyComparisonData = [
  { week: 'Week 1', thisYear: 820, lastYear: 750 },
  { week: 'Week 2', thisYear: 850, lastYear: 780 },
  { week: 'Week 3', thisYear: 790, lastYear: 820 },
  { week: 'Week 4', thisYear: 960, lastYear: 890 }
]

const efficiencyMetrics = [
  { metric: 'Heating Efficiency', current: 85, target: 90, color: '#ef4444' },
  { metric: 'Water Heating', current: 78, target: 80, color: '#f59e0b' },
  { metric: 'Insulation Score', current: 92, target: 85, color: '#97c50a' },
  { metric: 'Overall Rating', current: 88, target: 85, color: '#84b300' }
]

interface DashboardChartsProps {
  period?: '7d' | '30d' | '90d' | '1y'
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ period = '30d' }) => {
  const [selectedTab, setSelectedTab] = useState('consumption')

  const getEfficiencyColor = (current: number, target: number) => {
    if (current >= target) return 'text-lime-600'
    if (current >= target * 0.9) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Interactive Charts Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-lime-600" />
            Energy Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="consumption">Usage Pattern</TabsTrigger>
              <TabsTrigger value="comparison">Weekly Compare</TabsTrigger>
              <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            </TabsList>

            <TabsContent value="consumption" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">24-Hour Usage Pattern</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-lime-500 rounded-full mr-1"></div>
                      Usage (kWh)
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                      Cost (€)
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={hourlyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#666"
                      fontSize={11}
                      interval={3}
                    />
                    <YAxis 
                      yAxisId="usage"
                      stroke="#666"
                      fontSize={11}
                    />
                    <YAxis 
                      yAxisId="cost"
                      orientation="right"
                      stroke="#666"
                      fontSize={11}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'usage' ? `${value} kWh` : formatCurrency(value as number),
                        name === 'usage' ? 'Energy Usage' : 'Cost'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      yAxisId="usage"
                      type="monotone" 
                      dataKey="usage" 
                      stroke="#97c50a" 
                      fill="#97c50a" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Area 
                      yAxisId="cost"
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#f59e0b" 
                      fill="transparent"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Weekly Comparison</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-lime-500" />
                      <span>2024</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingDown className="h-4 w-4 text-gray-400" />
                      <span>2023</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={weeklyComparisonData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value) => [`${formatNumber(value as number)} kWh`, '']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="thisYear" 
                      fill="#97c50a" 
                      radius={[4, 4, 0, 0]}
                      name="This Year"
                    />
                    <Bar 
                      dataKey="lastYear" 
                      fill="#e5e7eb" 
                      radius={[4, 4, 0, 0]}
                      name="Last Year"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="efficiency" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Efficiency Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {efficiencyMetrics.map((metric, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${getEfficiencyColor(metric.current, metric.target)}`}>
                            {metric.current}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Target: {metric.target}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${Math.min(metric.current, 100)}%`,
                            backgroundColor: metric.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Efficiency Insights</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Your overall efficiency score is <strong>88%</strong>, which is 3% above your target. 
                    Your heating system is performing well, but water heating could be optimized.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Usage</p>
                <p className="text-xl font-semibold">98.5 kWh</p>
                <p className="text-xs text-green-600">12% below average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Euro className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Cost</p>
                <p className="text-xl font-semibold">€14.78</p>
                <p className="text-xs text-blue-600">Estimated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Time</p>
                <p className="text-xl font-semibold">19:30</p>
                <p className="text-xs text-purple-600">Yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}