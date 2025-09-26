import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safe date formatting utility
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
  try {
    const date = new Date(dateString)
    if (typeof Intl !== 'undefined' && Intl.DateFormat) {
      return new Intl.DateFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...options
      }).format(date)
    } else {
      // Fallback formatting
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    }
  } catch (error) {
    return dateString
  }
}

// Safe currency formatting utility
export function formatCurrency(amount: number) {
  try {
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
      return new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    } else {
      // Fallback formatting
      return `€${amount.toFixed(2)}`
    }
  } catch (error) {
    return `€${amount.toFixed(2)}`
  }
}

// Safe number formatting utility
export function formatNumber(value: number) {
  try {
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
      return new Intl.NumberFormat().format(value)
    } else {
      // Fallback formatting
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  } catch (error) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}
