import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-[420] leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-shade-70 active:bg-shade-70",
        primary: "bg-primary text-on-primary hover:bg-shade-70 active:bg-shade-70",
        outline: "border-2 border-on-dark bg-transparent text-on-dark hover:bg-on-dark/10",
        "outline-light": "border border-ink bg-canvas-light text-ink hover:bg-shade-30",
        aloe: "bg-aloe-10 text-ink hover:opacity-85",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        ghost: "text-ink hover:bg-shade-30 dark:text-on-dark dark:hover:bg-white/10",
        link: "text-ink underline-offset-4 hover:underline dark:text-on-dark",
      },
      size: {
        default: "h-auto px-6 py-3",
        sm: "h-auto px-4 py-2 text-sm",
        lg: "h-auto px-8 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
