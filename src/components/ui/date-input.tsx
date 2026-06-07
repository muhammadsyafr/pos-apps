"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "@daypicker/react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  inline?: boolean
  size?: "default" | "sm"
  className?: string
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function formatString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function useCalendarPosition(triggerRef: React.RefObject<HTMLElement | null>, isOpen: boolean) {
  const [position, setPosition] = React.useState({ top: -9999, left: -9999 })
  const [ready, setReady] = React.useState(false)

  const updatePosition = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const calendarWidth = 300
      const gap = 8
      const vw = window.innerWidth

      let left = rect.left + window.scrollX
      if (left + calendarWidth > vw + window.scrollX - 16) {
        left = vw + window.scrollX - calendarWidth - 16
      }
      if (left < window.scrollX + 16) {
        left = window.scrollX + 16
      }

      setPosition({
        top: rect.bottom + window.scrollY + gap,
        left,
      })
    }
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      // Use rAF to ensure DOM has settled before measuring
      const frame = requestAnimationFrame(() => {
        updatePosition()
        setReady(true)
      })
      window.addEventListener("scroll", updatePosition, true)
      window.addEventListener("resize", updatePosition)
      return () => {
        cancelAnimationFrame(frame)
        setReady(false)
        window.removeEventListener("scroll", updatePosition, true)
        window.removeEventListener("resize", updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  return { position, ready }
}

function useResponsive<T>(mobile: T, desktop: T): T {
  const [value, setValue] = React.useState<T>(mobile)
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)")
    const handler = (e: MediaQueryListEvent) => setValue(e.matches ? desktop : mobile)
    setValue(mql.matches ? desktop : mobile)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return value
}

/* ── DateInput (single) ────────────────────────────────────── */

export function DateInput({
  value,
  onChange,
  placeholder = "Select date",
  label,
  inline = false,
  size = "default",
  className,
}: DateInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const { position, ready } = useCalendarPosition(triggerRef, isOpen)

  const selectedDate = React.useMemo(() => parseDate(value), [value])

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      onChange(date ? formatString(date) : "")
      setIsOpen(false)
    },
    [onChange],
  )

  const calendar = isOpen
    ? createPortal(
        <>
          <div className="fixed inset-0 z-[1000]" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              "fixed z-[1001] bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-4 border border-hairline-light dark:border-hairline-dark p-4 w-[calc(100vw-32px)] max-w-[300px]",
              !ready && "invisible",
            )}
            style={{ top: position.top, left: position.left }}
          >
            <DayPicker
              animate
              mode="single"
              navLayout="around"
              selected={selectedDate}
              onSelect={handleSelect}
              showOutsideDays
              footer={
                selectedDate
                  ? format(selectedDate, "EEEE, MMMM d, yyyy")
                  : "Pick a date"
              }
            />
            <div className="flex gap-2 mt-4 pt-3 border-t border-hairline-light dark:border-hairline-dark">
              <button
                type="button"
                onClick={() => {
                  onChange("")
                  setIsOpen(false)
                }}
                className="flex-1 rounded-lg border border-ink/20 dark:border-shade-40/20 px-4 py-2 text-xs font-medium text-ink dark:text-on-dark hover:bg-shade-30 dark:hover:bg-shade-70/10 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(formatString(new Date()))
                  setIsOpen(false)
                }}
                className="flex-1 rounded-lg bg-aloe-10 px-4 py-2 text-xs font-medium text-ink hover:opacity-85 transition-opacity"
              >
                Today
              </button>
            </div>
          </div>
        </>,
        document.body,
      )
    : null

  return (
    <div className={cn("relative", inline ? "flex items-center gap-2 flex-1" : "flex-1", className)}>
      {label && (
        <label className={cn(
          "text-xs font-semibold text-shade-50 dark:text-shade-40 uppercase tracking-wide",
          inline ? "shrink-0" : "mb-1.5 block",
        )}>
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-cream dark:bg-canvas-night/50 px-3 py-2 text-sm font-medium transition-colors hover:border-shade-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
          size === "sm" && "h-8 py-1 text-xs",
          size === "default" && "h-10",
          selectedDate ? "text-ink dark:text-on-dark" : "text-shade-40 dark:text-shade-50",
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-neutral-500" />
        <span className="truncate text-left">
          {selectedDate ? format(selectedDate, "MMM dd, yyyy") : placeholder}
        </span>
      </button>
      {calendar}
    </div>
  )
}

/* ── DateRangeInput ────────────────────────────────────────── */

interface DateRangeInputProps {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
  placeholder?: string
  label?: string
  inline?: boolean
  size?: "default" | "sm"
  className?: string
}

export function DateRangeInput({
  from,
  to,
  onChange,
  placeholder = "Select dates",
  label,
  inline = false,
  size = "default",
  className,
}: DateRangeInputProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const innerRef = React.useRef<HTMLDivElement>(null)
  const { position, ready } = useCalendarPosition(triggerRef, isOpen)
  const numberOfMonths = useResponsive(1, 2)
  const [draft, setDraft] = React.useState<{ from: Date; to?: Date } | undefined>()

  const fromDate = React.useMemo(() => parseDate(from), [from])
  const toDate = React.useMemo(() => parseDate(to), [to])

  const committed = React.useMemo(
    () => (fromDate || toDate ? { from: fromDate, to: toDate } : undefined),
    [fromDate, toDate],
  )

  const selected = draft ?? committed

  const handleSelect = React.useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (range?.from && range?.to) {
        const f = formatString(range.from)
        const t = formatString(range.to)
        if (f !== from || t !== to) {
          onChange({ from: f, to: t })
        }
        setDraft(undefined)
        setIsOpen(false)
      } else if (range?.from && !range?.to) {
        setDraft({ from: range.from })
      } else {
        setDraft(undefined)
      }
    },
    [onChange, from, to],
  )

  const handleOpen = React.useCallback(() => {
    setDraft(undefined)
    setIsOpen(true)
  }, [])

  const footerText = React.useMemo(() => {
    const active = draft ?? committed
    if (active?.from && active?.to) {
      return `${format(active.from, "MMM d")} – ${format(active.to, "MMM d, yyyy")}`
    }
    if (active?.from) {
      return `${format(active.from, "MMM d, yyyy")} – select end date`
    }
    return "Select a date range"
  }, [draft, committed])

  const displayText =
    fromDate && toDate
      ? `${format(fromDate, "MMM dd")} — ${format(toDate, "MMM dd, yyyy")}`
      : fromDate
        ? `${format(fromDate, "MMM dd, yyyy")} — ...`
        : placeholder

  const calendar = isOpen
    ? createPortal(
        <>
          <div className="fixed inset-0 z-[1000]" onClick={() => { setDraft(undefined); setIsOpen(false) }} />
          <div
            className={cn(
              "fixed z-[1001] bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-4 border border-hairline-light dark:border-hairline-dark p-4",
              numberOfMonths > 1
                ? "w-fit max-w-[calc(100vw-32px)]"
                : "w-[calc(100vw-32px)] max-w-[300px]",
              !ready && "invisible",
            )}
            style={{ top: position.top, left: position.left }}
            ref={innerRef}
          >
            <DayPicker
              mode="range"
              navLayout="around"
              numberOfMonths={numberOfMonths}
              min={1}
              selected={selected}
              onSelect={handleSelect}
              showOutsideDays
              footer={footerText}
            />
            <div className="flex gap-2 mt-4 pt-3 border-t border-hairline-light dark:border-hairline-dark">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  if (from || to) {
                    onChange({ from: "", to: "" })
                  }
                }}
                className="flex-1 rounded-lg border border-ink/20 dark:border-shade-40/20 px-4 py-2 text-xs font-medium text-ink dark:text-on-dark hover:bg-shade-30 dark:hover:bg-shade-70/10 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = formatString(new Date())
                  onChange({ from: today, to: today })
                  setIsOpen(false)
                }}
                className="flex-1 rounded-lg bg-aloe-10 px-4 py-2 text-xs font-medium text-ink hover:opacity-85 transition-opacity"
              >
                Today
              </button>
            </div>
          </div>
        </>,
        document.body,
      )
    : null

  return (
    <div className={cn("relative", inline ? "flex items-center gap-2 flex-1" : "flex-1", className)}>
      {label && (
        <label className={cn(
          "text-xs font-semibold text-shade-50 dark:text-shade-40 uppercase tracking-wide",
          inline ? "shrink-0" : "mb-1.5 block",
        )}>
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-cream dark:bg-canvas-night/50 px-3 py-2 text-sm font-medium transition-colors hover:border-shade-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
          size === "sm" && "h-8 py-1 text-xs",
          size === "default" && "h-10",
          fromDate ? "text-ink dark:text-on-dark" : "text-shade-40 dark:text-shade-50",
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-neutral-500" />
        <span className="truncate text-left">{displayText}</span>
      </button>
      {calendar}
    </div>
  )
}
