import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Upload, Hash, Mail, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Progress } from '../ui/progress'
import { useRegistrationStore } from '../../stores/registrationStore'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'

const steps = [
  { id: 1, title: 'Account Details', description: 'Basic information' },
  { id: 2, title: 'Heatmeter Connection', description: 'Link your meter' },
  { id: 3, title: 'Verification', description: 'Verify your identity' },
  { id: 4, title: 'Security', description: 'Set your password' }
]

export const RegisterFlow: React.FC = () => {
  const { 
    currentStep, 
    data, 
    errors, 
    isLoading,
    verificationSent,
    verificationAttempts,
    nextStep, 
    previousStep, 
    updateData, 
    sendVerification,
    verifyCode,
    reset 
  } = useRegistrationStore()
  
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const progress = (currentStep / steps.length) * 100

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.email && data.fullName && data.locale)
      case 2:
        return true // Heatmeter is optional
      case 3:
        return !!(data.verificationToken || (data.verificationType && (data.phone || data.invoiceFile)))
      case 4:
        return !!(data.password && data.passwordConfirm && data.password === data.passwordConfirm)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep()
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const handleFinish = async () => {
    if (!validateStep(4)) {
      toast.error('Please complete all required fields')
      return
    }

    try {
      await register(data)
      toast.success('Account created successfully!')
      reset()
      navigate('/dashboard')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join thousands of users managing their energy efficiently</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Step 1: Account Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Account Details</h2>
                <p className="text-gray-600">Let's start with your basic information</p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={data.email || ''}
                    onChange={(e) => updateData({ email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={data.fullName || ''}
                    onChange={(e) => updateData({ fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+355 69 123 4567"
                    value={data.phone || ''}
                    onChange={(e) => updateData({ phone: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Optional - required for SMS verification
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locale">Preferred Language *</Label>
                  <Select value={data.locale} onValueChange={(value: any) => updateData({ locale: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sq">Shqip (Albanian)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Heatmeter Connection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Hash className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Connect Your Heatmeter</h2>
                <p className="text-gray-600">
                  Link your heatmeter for automatic billing and consumption tracking
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heatmeterId">Heatmeter ID</Label>
                  <Input
                    id="heatmeterId"
                    type="text"
                    placeholder="HM123456"
                    value={data.heatmeterId || ''}
                    onChange={(e) => updateData({ heatmeterId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Find this on your latest invoice or meter display
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Skip this step?</strong> You can add your heatmeter later from your profile settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verify Your Identity</h2>
                <p className="text-gray-600">
                  Choose how you'd like to verify your account
                </p>
              </div>

              {!data.verificationType ? (
                <div className="grid gap-4">
                  <button
                    className="p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    onClick={() => updateData({ verificationType: 'otp' })}
                    disabled={!data.phone}
                  >
                    <div className="flex items-center">
                      <Mail className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-medium">SMS Verification</h3>
                        <p className="text-sm text-gray-600">
                          {data.phone ? `Send code to ${data.phone}` : 'Phone number required'}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    className="p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    onClick={() => updateData({ verificationType: 'invoice' })}
                  >
                    <div className="flex items-center">
                      <Upload className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-medium">Invoice Upload</h3>
                        <p className="text-sm text-gray-600">
                          Upload a recent invoice for verification
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : data.verificationType === 'otp' ? (
                <OTPVerification 
                  phone={data.phone!}
                  verificationSent={verificationSent}
                  isLoading={isLoading}
                  attempts={verificationAttempts}
                  onSendCode={sendVerification}
                  onVerifyCode={verifyCode}
                  onBack={() => updateData({ verificationType: undefined })}
                />
              ) : (
                <InvoiceUpload
                  onFileUpload={(file) => updateData({ invoiceFile: file })}
                  onVerify={() => data.invoiceFile && verifyCode('')}
                  onBack={() => updateData({ verificationType: undefined })}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}

          {/* Step 4: Password */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Secure Your Account</h2>
                <p className="text-gray-600">Create a strong password to protect your account</p>
              </div>

              <PasswordStep
                password={data.password || ''}
                passwordConfirm={data.passwordConfirm || ''}
                onPasswordChange={(password) => updateData({ password })}
                onPasswordConfirmChange={(passwordConfirm) => updateData({ passwordConfirm })}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!validateStep(4) || isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// OTP Verification Component
const OTPVerification: React.FC<{
  phone: string
  verificationSent: boolean
  isLoading: boolean
  attempts: number
  onSendCode: () => void
  onVerifyCode: (code: string) => Promise<boolean>
  onBack: () => void
}> = ({ phone, verificationSent, isLoading, attempts, onSendCode, onVerifyCode, onBack }) => {
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  React.useEffect(() => {
    if (verificationSent && countdown === 0) {
      setCountdown(60)
    }
  }, [verificationSent])

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async () => {
    const success = await onVerifyCode(code)
    if (!success) {
      setCode('')
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Choose Different Method
      </Button>

      {!verificationSent ? (
        <div className="text-center">
          <p className="mb-4">Send verification code to {phone}?</p>
          <Button onClick={onSendCode} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Code'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code sent to {phone}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
          </div>

          <Button 
            onClick={handleVerify}
            disabled={code.length !== 6 || isLoading || attempts >= 3}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onSendCode}
              disabled={countdown > 0 || isLoading}
              className="text-sm"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Button>
          </div>

          {attempts > 0 && (
            <p className="text-xs text-red-600 text-center">
              {attempts >= 3 ? 'Too many attempts. Try again later.' : `${3 - attempts} attempts remaining`}
            </p>
          )}

          <div className="bg-gray-50 p-3 rounded text-center">
            <p className="text-xs text-gray-600">Demo code: 123456</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Invoice Upload Component
const InvoiceUpload: React.FC<{
  onFileUpload: (file: File) => void
  onVerify: () => void
  onBack: () => void
  isLoading: boolean
}> = ({ onFileUpload, onVerify, onBack, isLoading }) => {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      onFileUpload(selectedFile)
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Choose Different Method
      </Button>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
          id="invoice-upload"
        />
        <label htmlFor="invoice-upload" className="cursor-pointer">
          <span className="text-blue-600 hover:text-blue-700">Upload invoice</span>
          <span className="text-gray-600"> or drag and drop</span>
        </label>
        <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG up to 10MB</p>
      </div>

      {file && (
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-green-800">
            <Check className="h-4 w-4 inline mr-2" />
            {file.name} uploaded successfully
          </p>
        </div>
      )}

      <Button 
        onClick={onVerify}
        disabled={!file || isLoading}
        className="w-full"
      >
        {isLoading ? 'Processing...' : 'Verify Invoice'}
      </Button>
    </div>
  )
}

// Password Step Component
const PasswordStep: React.FC<{
  password: string
  passwordConfirm: string
  onPasswordChange: (password: string) => void
  onPasswordConfirmChange: (passwordConfirm: string) => void
}> = ({ password, passwordConfirm, onPasswordChange, onPasswordConfirmChange }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const strength = getPasswordStrength(password)
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter a strong password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        {password && (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Password strength: {strength > 0 ? strengthLabels[strength - 1] : 'Too short'}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">Confirm Password *</Label>
        <div className="relative">
          <Input
            id="passwordConfirm"
            type={showPasswordConfirm ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={passwordConfirm}
            onChange={(e) => onPasswordConfirmChange(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
          >
            {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        {passwordConfirm && password !== passwordConfirm && (
          <p className="text-xs text-red-600">Passwords do not match</p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
        />
        <Label htmlFor="terms" className="text-sm leading-5">
          I agree to the{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
        </Label>
      </div>
    </div>
  )
}