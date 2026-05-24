import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-hairline-light bg-canvas-light px-3 py-2.5 text-base font-[420] leading-6 text-ink shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-shade-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:border-ink disabled:cursor-not-allowed disabled:opacity-50 dark:bg-canvas-night dark:text-on-dark dark:border-hairline-dark dark:placeholder:text-shade-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
