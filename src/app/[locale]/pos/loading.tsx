import { Skeleton } from "@/components/loading-skeleton"

export default function POSLoading() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="flex-1 p-4 lg:pr-96 lg:p-6 pb-40 lg:pb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-6">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-32 mt-2 hidden sm:block" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-10 w-full sm:w-48 lg:w-64 rounded-full" />
            <Skeleton className="h-10 w-full sm:w-40 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 lg:p-4 space-y-2"
            >
              <Skeleton className="h-20 lg:h-24 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 lg:top-16 lg:right-0 w-full lg:w-96 h-auto lg:h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-t lg:border-l lg:border-t-0 border-slate-200 dark:border-slate-700 z-30 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-16 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
