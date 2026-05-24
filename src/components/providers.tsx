"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/lib/use-theme"
import { ReactNode } from "react"
import { useDatabasePinger } from "@/lib/useDatabasePinger"
import { OfflineProvider } from "@/hooks/useOffline"
import { SyncStatus } from "@/components/sync-status"

function DatabasePinger() {
  useDatabasePinger(true)
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        <OfflineProvider>
          <DatabasePinger />
          <SyncStatus />
          {children}
        </OfflineProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}