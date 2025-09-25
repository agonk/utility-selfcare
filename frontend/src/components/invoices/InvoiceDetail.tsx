import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  CreditCard, 
  Calendar, 
  Zap, 
  Euro,
  MapPin,
  Hash,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { formatDate, formatCurrency } from '../ui/utils'

// Mock invoice detail data
const mockInvoiceDetail = {
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
  pdfUrl: '/invoices/INV-2024-12.pdf',
  billingAddress: {
    name: 'Arben Mehmeti',
    street: 'Rruga e Durrësit 123',
    city: 'Tiranë',
    postalCode: '1001',
    country: 'Albania'
  },
  consumption_breakdown: {
    previous_reading: 45680,
    current_reading: 49100,
    consumption_kwh: 3420,
    unit_price: 0.065,
    basic_charge: 15.00,
    environmental_fee: 8.50,
    tax_rate: 0.20
  },
  payment_info: {
    account_number: 'ACC-789456123',
    reference: 'HM123456-2024-12',
    bank_details: 'NLB Bank - IBAN: AL12345678901234567890'
  }
}

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // In real app, fetch invoice by ID
  const invoice = mockInvoiceDetail



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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-lime-600" />
      case 'unpaid':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const calculateSubtotal = () => {
    const consumptionCost = invoice.consumption_breakdown.consumption_kwh * invoice.consumption_breakdown.unit_price
    return consumptionCost + invoice.consumption_breakdown.basic_charge + invoice.consumption_breakdown.environmental_fee
  }

  const calculateTax = () => {
    return calculateSubtotal() * invoice.consumption_breakdown.tax_rate
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600">{invoice.period}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          {invoice.status === 'unpaid' && (
            <Link to="/payment/process" state={{ invoiceIds: [invoice.id] }}>
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(invoice.status)}
              <div>
                <h3 className="text-lg font-semibold">Invoice Status</h3>
                <p className="text-sm text-muted-foreground">
                  {invoice.status === 'paid' 
                    ? 'This invoice has been paid'
                    : `Due date: ${formatDate(invoice.dueDate)}`
                  }
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Period</p>
                    <p className="font-medium">
                      {formatDate(invoice.startDate)} - {formatDate(invoice.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consumption Details */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Previous Reading</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {invoice.consumption_breakdown.previous_reading.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-600">kWh</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Current Reading</p>
                    <p className="text-2xl font-bold text-green-900">
                      {invoice.consumption_breakdown.current_reading.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">kWh</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Total Consumption</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {invoice.consumption_breakdown.consumption_kwh.toLocaleString()}
                    </p>
                    <p className="text-sm text-orange-600">kWh</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Average daily consumption</span>
                    <span className="font-medium">
                      {Math.round(invoice.consumption_breakdown.consumption_kwh / 31)} kWh/day
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unit price</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.consumption_breakdown.unit_price)}/kWh
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Summary */}
        <div className="space-y-6">
          {/* Amount Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="h-5 w-5 mr-2" />
                Billing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Consumption charge</span>
                  <span className="text-sm">
                    {formatCurrency(invoice.consumption_breakdown.consumption_kwh * invoice.consumption_breakdown.unit_price)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Basic service charge</span>
                  <span className="text-sm">
                    {formatCurrency(invoice.consumption_breakdown.basic_charge)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Environmental fee</span>
                  <span className="text-sm">
                    {formatCurrency(invoice.consumption_breakdown.environmental_fee)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Tax ({Math.round(invoice.consumption_breakdown.tax_rate * 100)}%)</span>
                  <span className="text-sm">
                    {formatCurrency(calculateTax())}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{invoice.billingAddress.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.billingAddress.street}</p>
                <p className="text-sm text-muted-foreground">
                  {invoice.billingAddress.postalCode} {invoice.billingAddress.city}
                </p>
                <p className="text-sm text-muted-foreground">{invoice.billingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">{invoice.payment_info.account_number}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Payment Reference</p>
                  <p className="font-medium">{invoice.payment_info.reference}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Bank Details</p>
                  <p className="font-medium text-xs">{invoice.payment_info.bank_details}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}