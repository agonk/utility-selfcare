// Simple date utilities to replace date-fns
export const formatDistanceToNow = (date: Date | string, options?: { addSuffix?: boolean }): string => {
  const now = new Date()
  const dateObj = ensureDate(date)
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return options?.addSuffix ? 'less than a minute ago' : 'less than a minute'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    const suffix = options?.addSuffix ? ' ago' : ''
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}${suffix}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    const suffix = options?.addSuffix ? ' ago' : ''
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'}${suffix}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    const suffix = options?.addSuffix ? ' ago' : ''
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'}${suffix}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    const suffix = options?.addSuffix ? ' ago' : ''
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'}${suffix}`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  const suffix = options?.addSuffix ? ' ago' : ''
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'}${suffix}`
}

export const format = (date: Date | string, formatString: string): string => {
  const dateObj = ensureDate(date)
  const month = dateObj.toLocaleString('default', { month: 'short' })
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  
  switch (formatString) {
    case 'MMM dd, yyyy':
      return `${month} ${day}, ${year}`
    case 'yyyy-MM-dd':
      return `${year}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${day}`
    default:
      return dateObj.toLocaleDateString()
  }
}

// Helper function to ensure we have a Date object
const ensureDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date
  }
  return new Date(date)
}

export const isAfter = (date: Date | string, dateToCompare: Date | string): boolean => {
  const d1 = ensureDate(date)
  const d2 = ensureDate(dateToCompare)
  return d1.getTime() > d2.getTime()
}

export const isBefore = (date: Date | string, dateToCompare: Date | string): boolean => {
  const d1 = ensureDate(date)
  const d2 = ensureDate(dateToCompare)
  return d1.getTime() < d2.getTime()
}

// Safe date formatting that works in all environments
export const formatDate = (date: Date): string => {
  try {
    // Try to use toLocaleDateString with options as a fallback
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    // Fallback to manual formatting if Intl is not available
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }
}