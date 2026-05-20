"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Globe } from "lucide-react"

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
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
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{currentLang?.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                  locale === lang.code ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
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
