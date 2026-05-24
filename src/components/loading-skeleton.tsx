import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-shade-30 dark:bg-white/10 dark:bg-canvas-night",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-canvas-light dark:bg-canvas-night-elevated p-5 rounded-xl elevation-3 dark:elevation-1 space-y-3",
        className
      )}
      {...props}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
      <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-hairline-light dark:divide-hairline-dark">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton
                key={j}
                className="h-4"
                style={{ width: `${Math.max(60, 100 / cols + Math.random() * 40)}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonGrid({ items = 8, cols = 4 }: { items?: number; cols?: number }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1 p-4 space-y-3"
        >
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}
