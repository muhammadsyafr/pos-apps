"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import { useDatabasePinger } from "@/lib/useDatabasePinger"

function DatabasePinger() {
  useDatabasePinger(true)
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme={false}>
        <DatabasePinger />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}