"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { createPortal } from "react-dom"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  label?: string
}

export function DatePicker({ date, onSelect, placeholder = "Pick a date", label }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [isOpen])

  const calendar = isOpen ? createPortal(
    <>
      <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
      <div 
        className="fixed z-[70] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: 'auto'
        }}
      >
        <DayPicker
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect?.(selectedDate)
            setIsOpen(false)
          }}
          className="rdp-custom"
        />
        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 w-full">
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => {
              onSelect?.(undefined)
              setIsOpen(false)
            }}
            className="w-full text-xs h-8"
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSelect?.(new Date())
              setIsOpen(false)
            }}
            className="w-full text-xs h-8"
          >
            Today
          </Button>
        </div>
      </div>
    </>,
    document.body
  ) : null

  return (
    <div className="relative">
      {label && (
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
          {label}
        </label>
      )}
      <Button
        ref={buttonRef}
        variant="outline-light"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-start text-left font-normal bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800",
          !date && "text-slate-500 dark:text-slate-400"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
        {date ? format(date, "PPP") : <span>{placeholder}</span>}
      </Button>
      {calendar}
    </div>
  )
}
