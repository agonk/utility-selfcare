import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  CreditCard, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { formatCurrency } from '../ui/utils'

// Mock payment history data
const mockPayments = [
  {
    id: 'PAY-2024-001',
    invoiceNumber: 'HM123456-2024-11',
    amount: 180.50,
    date: '2024-12-10',
    method: 'Credit Card',
    status: 'completed' as const,
    transactionId: 'TXN-ABC123456',
    reference: 'NLB-CC-456789'
  },
  {
    id: 'PAY-2024-002',
    invoiceNumber: 'HM123456-2024-10',
    amount: 165.20,
    date: '2024-11-12',
    method: 'Bank Transfer',
    status: 'completed' as const,
    transactionId: 'TXN-DEF789012',
    reference: 'NLB-BT-789012'
  },
  {
    id: 'PAY-2024-003',
    invoiceNumber: 'HM123456-2024-09',
    amount: 125.40,
    date: '2024-10-08',
    method: 'Credit Card',
    status: 'completed' as const,
    transactionId: 'TXN-GHI345678',
    reference: 'NLB-CC-345678'
  },
  {
    id: 'PAY-2024-004',
    invoiceNumber: 'HM123456-2024-08',
    amount: 98.20,
    date: '2024-09-15',
    method: 'Credit Card',
    status: 'failed' as const,
    transactionId: 'TXN-JKL901234',
    reference: 'NLB-CC-901234',
    failureReason: 'Insufficient funds'
  },
  {
    id: 'PAY-2024-005',
    invoiceNumber: 'HM123456-2024-12',
    amount: 245.80,
    date: '2024-12-28',
    method: 'Credit Card',
    status: 'pending' as const,
    transactionId: 'TXN-MNO567890',
    reference: 'NLB-CC-567890'
  }
]

type PaymentStatus = 'all' | 'completed' | 'pending' | 'failed'

export const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all')

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = 
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-lime-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-lime-100 text-lime-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
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
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      } else {
        // Fallback formatting
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${hours}:${minutes}`
      }
    } catch (error) {
      return dateString
    }
  }

  const summaryStats = {
    totalPaid: mockPayments
      .filter(p => p.status === 'completed')
      .reduce((total, p) => total + p.amount, 0),
    pendingAmount: mockPayments
      .filter(p => p.status === 'pending')
      .reduce((total, p) => total + p.amount, 0),
    failedPayments: mockPayments.filter(p => p.status === 'failed').length,
    lastPayment: mockPayments
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your payment transactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/payment/process">
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summaryStats.totalPaid)}
                </p>
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
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summaryStats.pendingAmount)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.failedPayments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Payment</p>
                <p className="text-lg font-bold">
                  {summaryStats.lastPayment ? formatCurrency(summaryStats.lastPayment.amount) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summaryStats.lastPayment ? formatDate(summaryStats.lastPayment.date) : ''}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/payment/process">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <CreditCard className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Pay Outstanding</div>
                  <div className="text-xs opacity-90">
                    {formatCurrency(245.80)}
                  </div>
                </div>
              </Button>
            </Link>

            <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
              <RefreshCw className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Auto-Pay Setup</div>
                <div className="text-xs text-muted-foreground">
                  Enable automatic payments
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Download Receipt</div>
                <div className="text-xs text-muted-foreground">
                  Last transaction
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
              <AlertTriangle className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Report Issue</div>
                <div className="text-xs text-muted-foreground">
                  Payment problems
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by invoice, transaction ID, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: PaymentStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No payments found matching your criteria</p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium">
                          Payment for {payment.invoiceNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.method} • {payment.transactionId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.date)} • Ref: {payment.reference}
                        </p>
                        {payment.status === 'failed' && payment.failureReason && (
                          <p className="text-xs text-red-600 mt-1">
                            Failed: {payment.failureReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {payment.status === 'failed' && (
                        <Link to="/payment/process" state={{ invoiceNumber: payment.invoiceNumber }}>
                          <Button size="sm">
                            Retry
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4567</p>
                  <p className="text-sm text-muted-foreground">Visa • Expires 12/26</p>
                </div>
              </div>
              <Badge variant="outline">Primary</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">•••• •••• •••• 8901</p>
                  <p className="text-sm text-muted-foreground">Mastercard • Expires 09/27</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Remove
              </Button>
            </div>

            <Button variant="outline" className="w-full">
              Add New Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}