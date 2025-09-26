import { create } from 'zustand'

export interface RegistrationData {
  // Step 1: Account
  email: string
  fullName: string
  phone?: string
  locale: 'sq' | 'en'
  
  // Step 2: Heatmeter
  heatmeterId?: string
  
  // Step 3: Verification
  verificationType?: 'otp' | 'invoice'
  verificationToken?: string
  invoiceFile?: File
  
  // Step 4: Password
  password?: string
  passwordConfirm?: string
}

export interface RegistrationError {
  field: string
  message: string
}

interface RegistrationState {
  currentStep: number
  data: Partial<RegistrationData>
  errors: RegistrationError[]
  isLoading: boolean
  verificationSent: boolean
  verificationAttempts: number
  
  // Actions
  nextStep: () => void
  previousStep: () => void
  setStep: (step: number) => void
  updateData: (data: Partial<RegistrationData>) => void
  setErrors: (errors: RegistrationError[]) => void
  clearErrors: () => void
  setLoading: (loading: boolean) => void
  sendVerification: () => Promise<void>
  verifyCode: (code: string) => Promise<boolean>
  reset: () => void
}

// Mock verification functions
const mockSendOTP = async (phone: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(`OTP sent to ${phone}: 123456`) // In real app, this would be sent via SMS
}

const mockVerifyOTP = async (code: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return code === '123456' // Mock verification - always accept 123456
}

const mockVerifyInvoice = async (file: File): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  // Mock OCR processing - always return true for demo
  return true
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  currentStep: 1,
  data: {},
  errors: [],
  isLoading: false,
  verificationSent: false,
  verificationAttempts: 0,
  
  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 4) {
      set({ currentStep: currentStep + 1, errors: [] })
    }
  },
  
  previousStep: () => {
    const { currentStep } = get()
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1, errors: [] })
    }
  },
  
  setStep: (step: number) => {
    if (step >= 1 && step <= 4) {
      set({ currentStep: step, errors: [] })
    }
  },
  
  updateData: (newData: Partial<RegistrationData>) => {
    set((state) => ({ 
      data: { ...state.data, ...newData },
      errors: [] 
    }))
  },
  
  setErrors: (errors: RegistrationError[]) => {
    set({ errors })
  },
  
  clearErrors: () => {
    set({ errors: [] })
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  sendVerification: async () => {
    const { data } = get()
    set({ isLoading: true })
    
    try {
      if (data.verificationType === 'otp' && data.phone) {
        await mockSendOTP(data.phone)
        set({ 
          verificationSent: true, 
          isLoading: false,
          verificationAttempts: 0 
        })
      }
    } catch (error) {
      set({ 
        isLoading: false,
        errors: [{ field: 'verification', message: 'Failed to send verification code' }]
      })
    }
  },
  
  verifyCode: async (code: string) => {
    const { data, verificationAttempts } = get()
    set({ isLoading: true })
    
    try {
      let isValid = false
      
      if (data.verificationType === 'otp') {
        isValid = await mockVerifyOTP(code)
      } else if (data.verificationType === 'invoice' && data.invoiceFile) {
        isValid = await mockVerifyInvoice(data.invoiceFile)
      }
      
      if (isValid) {
        set({ 
          isLoading: false,
          verificationToken: 'verified-' + Date.now(),
          errors: []
        })
        return true
      } else {
        const attempts = verificationAttempts + 1
        set({ 
          isLoading: false,
          verificationAttempts: attempts,
          errors: [{ 
            field: 'code', 
            message: attempts >= 3 
              ? 'Too many failed attempts. Please try again later.' 
              : 'Invalid verification code. Please try again.'
          }]
        })
        return false
      }
    } catch (error) {
      set({ 
        isLoading: false,
        errors: [{ field: 'verification', message: 'Verification failed. Please try again.' }]
      })
      return false
    }
  },
  
  reset: () => {
    set({
      currentStep: 1,
      data: {},
      errors: [],
      isLoading: false,
      verificationSent: false,
      verificationAttempts: 0
    })
  }
}))