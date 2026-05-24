"use client"

import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Globe } from "lucide-react"

const localeSet = new Set(["en", "id"])

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "id", label: "Indonesia", flag: "🇮🇩" },
  ]

  const currentLang = languages.find(l => l.code === locale)

  const onSelect = (nextLocale: string) => {
    if (locale === nextLocale) {
      setIsOpen(false)
      return
    }

    const segments = pathname.split("/").filter(Boolean)
    const rest = [...segments]

    if (rest[0] && localeSet.has(rest[0])) rest.shift()
    if (rest[0] && localeSet.has(rest[0])) rest.shift()

    const newPath = `/${[nextLocale, ...rest].join("/")}`

    window.location.assign(newPath)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-shade-30/50 dark:hover:bg-white/5 rounded-full transition-colors"
      >
        <Globe className="w-4 h-4 text-shade-50 dark:text-shade-40" />
        <span className="text-sm font-[420] text-shade-50 dark:text-shade-40">{currentLang?.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-shade-50 dark:text-shade-40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 w-44 bg-canvas-light dark:bg-canvas-night-elevated rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)] z-50 py-1 border border-hairline-light dark:border-hairline-dark">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-shade-30/50 dark:hover:bg-white/5 transition-colors ${
                  locale === lang.code ? 'text-ink dark:text-on-dark font-[550]' : 'text-shade-50 dark:text-shade-40'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
