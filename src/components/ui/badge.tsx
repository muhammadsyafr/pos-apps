import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-[500] tracking-[0.28px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary",
        secondary: "bg-shade-30 text-ink",
        mint: "bg-aloe-10 text-ink",
        neutral: "bg-shade-30 text-ink",
        outline: "border border-hairline-light text-ink dark:border-hairline-dark dark:text-on-dark",
        destructive: "bg-red-600 text-white",
        warning: "bg-yellow-500 text-black",
        success: "bg-aloe-10 text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
