"use client"

import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Globe } from "lucide-react"

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

    const segments = pathname.split("/")
    const currentLocale = segments[1]

    let newPath: string
    if (currentLocale === "en" || currentLocale === "id") {
      segments[1] = nextLocale
      newPath = segments.join("/")
    } else {
      newPath = `/${nextLocale}${pathname}`
    }

    window.location.href = newPath
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-surface-container-low dark:hover:bg-surface-container-high rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4 text-on-surface-variant" />
        <span className="text-sm font-medium text-on-surface-variant">{currentLang?.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 w-44 bg-surface-container-lowest dark:bg-surface-container-low rounded-xl shadow-[0_12px_32px_rgba(25,28,30,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)] z-50 py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors ${
                  locale === lang.code ? 'text-primary font-medium' : 'text-on-surface'
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
