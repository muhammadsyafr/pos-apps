import { Skeleton } from "@/components/loading-skeleton"

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-48 mt-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1 p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1 p-6 space-y-4">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
