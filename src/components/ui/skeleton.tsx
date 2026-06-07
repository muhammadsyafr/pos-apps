import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-shade-20 dark:bg-shade-70", className)}
      {...props}
    />
  )
}

export { Skeleton }
