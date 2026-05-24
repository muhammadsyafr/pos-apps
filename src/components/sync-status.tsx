"use client"

import { useOffline } from "@/hooks/useOffline"
import { Wifi, WifiOff, RefreshCw, Check } from "lucide-react"

export function SyncStatus() {
  const { isOnline, pendingCount, isSyncing } = useOffline()

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-bold">Offline</span>
        {pendingCount > 0 && (
          <span className="bg-amber-600 px-2 py-0.5 rounded-full text-xs">
            {pendingCount} pending
          </span>
        )}
      </div>
    )
  }

  if (isSyncing) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm font-bold">Syncing...</span>
      </div>
    )
  }

  if (pendingCount > 0) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm font-bold">{pendingCount} to sync</span>
      </div>
    )
  }

  return null
}
