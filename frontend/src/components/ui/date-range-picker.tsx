import React, { useState } from 'react'
import { Calendar, CalendarDays } from 'lucide-react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar as CalendarComponent } from './calendar'
import { formatDate } from '../../utils/dateUtils'

interface DateRange {
  from?: Date
  to?: Date
}

interface DatePickerRangeProps {
  date: DateRange
  setDate: (date: DateRange) => void
  placeholder?: string
  className?: string
}

export const DatePickerRange: React.FC<DatePickerRangeProps> = ({
  date,
  setDate,
  placeholder = "Pick a date range",
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const formatDateRange = (range: DateRange) => {
    if (!range.from) return placeholder
    
    if (!range.to) return formatDate(range.from)
    
    return `${formatDate(range.from)} - ${formatDate(range.to)}`
  }

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range || {})
    if (range?.from && range?.to) {
      setIsOpen(false)
    }
  }

  const clearDate = () => {
    setDate({})
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[300px] justify-start text-left font-normal ${className}`}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {formatDateRange(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Select date range</span>
            {(date.from || date.to) && (
              <Button variant="ghost" size="sm" onClick={clearDate}>
                Clear
              </Button>
            )}
          </div>
        </div>
        <CalendarComponent
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}