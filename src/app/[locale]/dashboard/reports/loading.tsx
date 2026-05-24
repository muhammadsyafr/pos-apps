import { Skeleton } from "@/components/loading-skeleton"

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-40 rounded-full" />
      </div>

      <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
        <div className="divide-y divide-hairline-light dark:divide-hairline-dark">
          <div className="px-5 py-3 grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-4 grid grid-cols-5 gap-4 items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-hairline-light dark:border-hairline-dark flex justify-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  )
}
