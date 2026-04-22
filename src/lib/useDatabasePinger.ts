import { useEffect, useRef } from 'react'

const PING_INTERVAL = 4 * 60 * 1000

export function useDatabasePinger(enabled: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    const ping = async () => {
      try {
        await fetch('/api/ping', { cache: 'no-store' })
      } catch (error) {
        console.error('Ping failed:', error)
      }
    }

    ping()
    intervalRef.current = setInterval(ping, PING_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled])
}