import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  CreditCard, 
  Building2, 
  Lock, 
  CheckCircle2,
  AlertTriangle,
  Euro,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { formatCurrency, formatDate } from '../ui/utils'
import { toast } from 'sonner'

// Mock invoice data for payment
const mockInvoices = [
  {
    id: 'INV-2024-12',
    invoiceNumber: 'HM123456-2024-12',
    period: 'December 2024',
    amount: 245.80,
    dueDate: '2025-01-15'
  },
  {
    id: 'INV-2024-08',
    invoiceNumber: 'HM123456-2024-08',
    period: 'August 2024',
    amount: 98.20,
    dueDate: '2024-09-15'
  }
]

enum PaymentStage {
  SELECT_INVOICES = 'select',
  PAYMENT_METHOD = 'method',
  REVIEW_PAYMENT = 'review',
  PROCESSING = 'processing',
  CONFIRMATION = 'confirmation'
}

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'bank_transfer'
  name: string
  details: string
  icon: React.ReactNode
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'nlb_card',
    type: 'credit_card',
    name: 'Credit/Debit Card',
    details: 'Visa, Mastercard, American Express',
    icon: <CreditCard className="h-6 w-6" />
  },
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    name: 'Bank Transfer',
    details: 'Direct transfer from your bank account',
    icon: <Building2 className="h-6 w-6" />
  }
]

export const PaymentFlow: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [currentStage, setCurrentStage] = useState<PaymentStage>(PaymentStage.SELECT_INVOICES)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | null>(null)
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [saveCard, setSaveCard] = useState(false)

  // Initialize with pre-selected invoices from navigation state
  useEffect(() => {
    if (location.state?.invoiceIds) {
      setSelectedInvoiceIds(location.state.invoiceIds)
      setCurrentStage(PaymentStage.PAYMENT_METHOD)
    }
  }, [location.state])



  const getSelectedInvoices = () => {
    return mockInvoices.filter(inv => selectedInvoiceIds.includes(inv.id))
  }

  const getTotalAmount = () => {
    return getSelectedInvoices().reduce((total, inv) => total + inv.amount, 0)
  }

  const handleInvoiceSelection = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoiceIds(prev => [...prev, invoiceId])
    } else {
      setSelectedInvoiceIds(prev => prev.filter(id => id !== invoiceId))
    }
  }

  const handleNext = () => {
    switch (currentStage) {
      case PaymentStage.SELECT_INVOICES:
        if (selectedInvoiceIds.length === 0) {
          toast.error('Please select at least one invoice to pay')
          return
        }
        setCurrentStage(PaymentStage.PAYMENT_METHOD)
        break
      case PaymentStage.PAYMENT_METHOD:
        if (!selectedPaymentMethod) {
          toast.error('Please select a payment method')
          return
        }
        setCurrentStage(PaymentStage.REVIEW_PAYMENT)
        break
      case PaymentStage.REVIEW_PAYMENT:
        processPayment()
        break
    }
  }

  const processPayment = async () => {
    setCurrentStage(PaymentStage.PROCESSING)
    setProcessingProgress(0)

    // Simulate payment processing
    const steps = [
      { progress: 20, message: 'Validating payment details...' },
      { progress: 40, message: 'Connecting to payment gateway...' },
      { progress: 60, message: 'Processing payment...' },
      { progress: 80, message: 'Confirming transaction...' },
      { progress: 100, message: 'Payment completed!' }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingProgress(step.progress)
      
      if (step.progress === 100) {
        // Simulate random success/failure for demo
        const success = Math.random() > 0.2 // 80% success rate
        setPaymentResult(success ? 'success' : 'failed')
        setCurrentStage(PaymentStage.CONFIRMATION)
      }
    }
  }

  const getStageProgress = () => {
    const stages = Object.values(PaymentStage)
    const currentIndex = stages.indexOf(currentStage)
    return ((currentIndex + 1) / stages.length) * 100
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
    return formatted.slice(0, 19) // Max 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
            <p className="text-gray-600">Complete your payment securely</p>
          </div>
        </div>
        
        {currentStage !== PaymentStage.CONFIRMATION && (
          <Badge variant="outline">
            <Lock className="h-3 w-3 mr-1" />
            Secure Payment
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      {currentStage !== PaymentStage.CONFIRMATION && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Payment Progress</span>
            <span>{Math.round(getStageProgress())}% Complete</span>
          </div>
          <Progress value={getStageProgress()} className="h-2" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Select Invoices */}
          {currentStage === PaymentStage.SELECT_INVOICES && (
            <Card>
              <CardHeader>
                <CardTitle>Select Invoices to Pay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedInvoiceIds.includes(invoice.id)}
                      onCheckedChange={(checked) => 
                        handleInvoiceSelection(invoice.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <p className="font-medium">{invoice.period}</p>
                      <p className="text-sm text-gray-600">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      {new Date(invoice.dueDate) < new Date() && (
                        <Badge variant="destructive" className="text-xs">Overdue</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment Method Selection */}
          {currentStage === PaymentStage.PAYMENT_METHOD && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.details}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Card Details Form */}
                {selectedPaymentMethod === 'nlb_card' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Card Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          maxLength={5}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          placeholder="John Doe"
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveCard"
                        checked={saveCard}
                        onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                      />
                      <Label htmlFor="saveCard" className="text-sm">
                        Save this card for future payments
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Review Payment */}
          {currentStage === PaymentStage.REVIEW_PAYMENT && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Payment Method</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                    </p>
                    {selectedPaymentMethod === 'nlb_card' && cardNumber && (
                      <p className="text-sm text-gray-600">•••• •••• •••• {cardNumber.slice(-4)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Invoices to Pay</h4>
                  <div className="space-y-2">
                    {getSelectedInvoices().map((invoice) => (
                      <div key={invoice.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.period}</p>
                          <p className="text-sm text-gray-600">{invoice.invoiceNumber}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-lime-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Lock className="h-4 w-4 text-lime-600 mr-2" />
                    <span className="text-sm font-medium text-lime-900">Secure Payment</span>
                  </div>
                  <p className="text-sm text-lime-800">
                    Your payment is protected by bank-level encryption and processed securely through NLB Bank.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing */}
          {currentStage === PaymentStage.PROCESSING && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-8 w-8 text-lime-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold">Processing Payment</h3>
                  <p className="text-gray-600">Please don't close this window...</p>
                  <Progress value={processingProgress} className="h-2" />
                  <p className="text-sm text-gray-500">{processingProgress}% complete</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation */}
          {currentStage === PaymentStage.CONFIRMATION && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    paymentResult === 'success' ? 'bg-lime-100' : 'bg-red-100'
                  }`}>
                    {paymentResult === 'success' ? (
                      <CheckCircle2 className="h-8 w-8 text-lime-600" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold">
                    {paymentResult === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                  </h3>
                  
                  <p className="text-gray-600">
                    {paymentResult === 'success' 
                      ? `Your payment of ${formatCurrency(getTotalAmount())} has been processed successfully.`
                      : 'We were unable to process your payment. Please try again or contact support.'
                    }
                  </p>

                  {paymentResult === 'success' && (
                    <div className="bg-lime-50 p-4 rounded-lg">
                      <p className="text-sm text-lime-800">
                        Transaction ID: TXN-{Date.now()}
                      </p>
                      <p className="text-sm text-lime-800">
                        You will receive a confirmation email shortly.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3 justify-center">
                    {paymentResult === 'success' ? (
                      <>
                        <Button onClick={() => navigate('/dashboard')}>
                          Back to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/invoices')}>
                          View Invoices
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => setCurrentStage(PaymentStage.PAYMENT_METHOD)}>
                          Try Again
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/payments')}>
                          Contact Support
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Summary Sidebar */}
        {currentStage !== PaymentStage.CONFIRMATION && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Euro className="h-5 w-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSelectedInvoices().map((invoice) => (
                  <div key={invoice.id} className="flex justify-between text-sm">
                    <span>{invoice.period}</span>
                    <span>{formatCurrency(invoice.amount)}</span>
                  </div>
                ))}
                
                {getSelectedInvoices().length > 0 && (
                  <>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(getTotalAmount())}</span>
                    </div>
                  </>
                )}

                {currentStage !== PaymentStage.PROCESSING && (
                  <Button 
                    className="w-full" 
                    onClick={handleNext}
                    disabled={
                      (currentStage === PaymentStage.SELECT_INVOICES && selectedInvoiceIds.length === 0) ||
                      (currentStage === PaymentStage.PAYMENT_METHOD && !selectedPaymentMethod)
                    }
                  >
                    {currentStage === PaymentStage.SELECT_INVOICES && 'Continue to Payment'}
                    {currentStage === PaymentStage.PAYMENT_METHOD && 'Review Payment'}
                    {currentStage === PaymentStage.REVIEW_PAYMENT && `Pay ${formatCurrency(getTotalAmount())}`}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  If you're experiencing issues with payment, contact our support team.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}