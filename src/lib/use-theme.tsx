"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
})

const STORAGE_KEY = "theme"
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light"
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system"
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {}
  return "system"
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme
  const doc = document.documentElement
  doc.classList.remove("light", "dark")
  doc.classList.add(resolved)
  doc.style.colorScheme = resolved
}

export function ThemeProvider({ children, attribute = "class", defaultTheme = "system" }: {
  children: ReactNode
  attribute?: string
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    const stored = getStoredTheme()
    return stored === "system" ? getSystemTheme() : stored as "light" | "dark"
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const mql = window.matchMedia(COLOR_SCHEME_QUERY)
    function handler() {
      if (theme === "system") {
        const sys = getSystemTheme()
        setResolvedTheme(sys)
        applyTheme("system")
      }
    }
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [theme])

  useEffect(() => {
    if (!mounted) return
    function handler(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        const t = e.newValue as Theme
        if (t === "light" || t === "dark" || t === "system") {
          setThemeState(t)
        }
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [mounted])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    try { localStorage.setItem(STORAGE_KEY, newTheme) } catch {}
  }, [])

  const resolved = theme === "system" ? resolvedTheme : (theme as "light" | "dark")

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: resolved }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
