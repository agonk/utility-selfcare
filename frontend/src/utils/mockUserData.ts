// Mock data generator for different users when impersonating
export interface MockInvoice {
  id: string
  number: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: string
  issuedDate: string
  consumption: number
  period: string
}

export interface MockConsumption {
  date: string
  consumption: number
  temperature: number
  efficiency: number
}

export interface MockUserData {
  userId: string
  invoices: MockInvoice[]
  consumption: MockConsumption[]
  totalPaid: number
  avgMonthlyConsumption: number
}

const generateMockData = (userId: string, userName: string): MockUserData => {
  const currentDate = new Date()
  const invoices: MockInvoice[] = []
  const consumption: MockConsumption[] = []
  
  // Generate invoices for the past 12 months
  for (let i = 0; i < 12; i++) {
    const invoiceDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const dueDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 25)
    const consumptionValue = Math.floor(Math.random() * 200) + 150 // 150-350 kWh
    const rate = 0.12 // €0.12 per kWh
    const baseAmount = consumptionValue * rate
    const fees = baseAmount * 0.15 // 15% fees and taxes
    const totalAmount = baseAmount + fees
    
    const isOverdue = dueDate < currentDate && Math.random() < 0.1 // 10% chance of overdue
    const isPending = dueDate > currentDate && Math.random() < 0.3 // 30% chance of pending
    const status = isOverdue ? 'overdue' : isPending ? 'pending' : 'paid'
    
    invoices.push({
      id: `inv-${userId}-${i}`,
      number: `INV-${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${userId.slice(-3)}`,
      amount: Math.round(totalAmount * 100) / 100,
      status,
      dueDate: dueDate.toISOString(),
      issuedDate: invoiceDate.toISOString(),
      consumption: consumptionValue,
      period: `${invoiceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    })
  }
  
  // Generate daily consumption data for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - i)
    
    // Simulate seasonal consumption patterns
    const month = date.getMonth()
    const winterMultiplier = month < 3 || month > 9 ? 1.5 : 1.0
    const baseConsumption = (Math.random() * 8 + 4) * winterMultiplier // 4-12 kWh per day, higher in winter
    
    consumption.push({
      date: date.toISOString().split('T')[0],
      consumption: Math.round(baseConsumption * 100) / 100,
      temperature: Math.floor(Math.random() * 15) + 5, // 5-20°C
      efficiency: Math.round((75 + Math.random() * 20) * 100) / 100 // 75-95% efficiency
    })
  }
  
  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
  
  const avgMonthlyConsumption = invoices.reduce((sum, inv) => sum + inv.consumption, 0) / invoices.length
  
  return {
    userId,
    invoices: invoices.reverse(), // Most recent first
    consumption: consumption.reverse(), // Chronological order
    totalPaid: Math.round(totalPaid * 100) / 100,
    avgMonthlyConsumption: Math.round(avgMonthlyConsumption)
  }
}

// Predefined mock data for specific users
const mockUserDataCache: Record<string, MockUserData> = {}

export const getMockUserData = (userId: string, userName: string): MockUserData => {
  if (!mockUserDataCache[userId]) {
    mockUserDataCache[userId] = generateMockData(userId, userName)
  }
  return mockUserDataCache[userId]
}

// Reset mock data (useful for testing)
export const resetMockUserData = (userId?: string) => {
  if (userId) {
    delete mockUserDataCache[userId]
  } else {
    Object.keys(mockUserDataCache).forEach(key => delete mockUserDataCache[key])
  }
}