import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Calendar,
  Euro,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { DatePickerRange } from '../ui/date-range-picker'
import { formatCurrency } from '../ui/utils'
import { useInvoices, useDownloadInvoicePDF } from '../../hooks/useInvoices'

// Mock invoice data (backup - remove after testing)
const mockInvoices = [
  {
    id: 'INV-2024-12',
    invoiceNumber: 'HM123456-2024-12',
    period: 'December 2024',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    heatmeterId: 'HM123456',
    consumption: 3420,
    amount: 245.80,
    status: 'unpaid' as const,
    issueDate: '2024-12-31',
    dueDate: '2025-01-15',
    pdfUrl: '/invoices/INV-2024-12.pdf'
  },
  {
    id: 'INV-2024-11',
    invoiceNumber: 'HM123456-2024-11',
    period: 'November 2024',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    heatmeterId: 'HM123456',
    consumption: 2890,
    amount: 180.50,
    status: 'paid' as const,
    issueDate: '2024-11-30',
    dueDate: '2024-12-15',
    paidDate: '2024-12-10',
    pdfUrl: '/invoices/INV-2024-11.pdf'
  },
  {
    id: 'INV-2024-10',
    invoiceNumber: 'HM123456-2024-10',
    period: 'October 2024',
    startDate: '2024-10-01',
    endDate: '2024-10-31',
    heatmeterId: 'HM123456',
    consumption: 2650,
    amount: 165.20,
    status: 'paid' as const,
    issueDate: '2024-10-31',
    dueDate: '2024-11-15',
    paidDate: '2024-11-12',
    pdfUrl: '/invoices/INV-2024-10.pdf'
  },
  {
    id: 'INV-2024-09',
    invoiceNumber: 'HM123456-2024-09',
    period: 'September 2024',
    startDate: '2024-09-01',
    endDate: '2024-09-30',
    heatmeterId: 'HM123456',
    consumption: 1980,
    amount: 125.40,
    status: 'paid' as const,
    issueDate: '2024-09-30',
    dueDate: '2024-10-15',
    paidDate: '2024-10-08',
    pdfUrl: '/invoices/INV-2024-09.pdf'
  },
  {
    id: 'INV-2024-08',
    invoiceNumber: 'HM123456-2024-08',
    period: 'August 2024',
    startDate: '2024-08-01',
    endDate: '2024-08-31',
    heatmeterId: 'HM123456',
    consumption: 1560,
    amount: 98.20,
    status: 'overdue' as const,
    issueDate: '2024-08-31',
    dueDate: '2024-09-15',
    pdfUrl: '/invoices/INV-2024-08.pdf'
  }
]

type InvoiceStatus = 'all' | 'paid' | 'unpaid' | 'overdue'

export const InvoicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const { data, isLoading, error } = useInvoices()
  const downloadPDF = useDownloadInvoicePDF()

  const apiInvoices = useMemo(() => {
    if (!data?.invoices) return []

    return data.invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.id,
      period: new Date(inv.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      startDate: inv.reading_date || inv.date,
      endDate: inv.date,
      heatmeterId: inv.customer_id,
      consumption: inv.kwh_consumed,
      amount: inv.outstanding,
      status: inv.status === 'paid' ? 'paid' as const :
              new Date(inv.due_date) < new Date() ? 'overdue' as const : 'unpaid' as const,
      issueDate: inv.date,
      dueDate: inv.due_date,
      paidDate: inv.status === 'paid' ? inv.date : undefined,
      pdfUrl: `/invoices/${inv.id}/pdf`,
      volumeM3: inv.volume_m3,
      gcalEquivalent: inv.gcal_equivalent
    }))
  }, [data])

  const invoices = apiInvoices.length > 0 ? apiInvoices : mockInvoices

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.period.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

    const matchesDateRange =
      !dateRange.from ||
      !dateRange.to ||
      (new Date(invoice.issueDate) >= dateRange.from && new Date(invoice.issueDate) <= dateRange.to)

    return matchesSearch && matchesStatus && matchesDateRange
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-lime-600" />
      case 'unpaid':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-lime-100 text-lime-800'
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
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

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const selectAllUnpaid = () => {
    const unpaidInvoices = filteredInvoices
      .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
      .map(inv => inv.id)
    setSelectedInvoices(unpaidInvoices)
  }

  const clearSelection = () => {
    setSelectedInvoices([])
  }

  const calculateSelectedTotal = () => {
    return filteredInvoices
      .filter(inv => selectedInvoices.includes(inv.id))
      .reduce((total, inv) => total + inv.amount, 0)
  }

  const summaryStats = {
    total: invoices.length,
    unpaid: invoices.filter(inv => inv.status === 'unpaid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalUnpaidAmount: invoices
      .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
      .reduce((total, inv) => total + inv.amount, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load invoices</h2>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your heating invoices
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {selectedInvoices.length > 0 && (
            <Link to="/payment/process" state={{ invoiceIds: selectedInvoices }}>
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Selected ({selectedInvoices.length})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{summaryStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.unpaid}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summaryStats.totalUnpaidAmount)}
                </p>
              </div>
              <Euro className="h-8 w-8 text-red-600" />
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
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: InvoiceStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <DatePickerRange 
              date={dateRange} 
              setDate={setDateRange}
              placeholder="Filter by date"
            />
          </div>

          {/* Bulk Actions */}
          {filteredInvoices.some(inv => inv.status === 'unpaid' || inv.status === 'overdue') && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={selectAllUnpaid}>
                  Select All Unpaid
                </Button>
                {selectedInvoices.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                )}
              </div>
              
              {selectedInvoices.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedInvoices.length} selected • Total: {formatCurrency(calculateSelectedTotal())}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No invoices found matching your criteria</p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
                      <Checkbox
                        checked={selectedInvoices.includes(invoice.id)}
                        onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                      />
                    )}
                    
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(invoice.status)}
                      <div>
                        <p className="font-medium">{invoice.period}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.invoiceNumber} • {invoice.consumption.toLocaleString()} kWh
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.status === 'paid' 
                            ? `Paid on ${formatDate(invoice.paidDate!)}`
                            : `Due ${formatDate(invoice.dueDate)}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/invoices/${invoice.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadPDF.mutate(invoice.id)}
                        disabled={downloadPDF.isPending}
                      >
                        {downloadPDF.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {invoice.status === 'unpaid' && (
                        <Link to="/payment/process" state={{ invoiceIds: [invoice.id] }}>
                          <Button size="sm">
                            Pay Now
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
    </div>
  )
}