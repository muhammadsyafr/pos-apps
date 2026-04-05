"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value
    
    if (locale === nextLocale) return

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
    <select
      value={locale}
      onChange={onSelectChange}
      className="bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 cursor-pointer outline-none"
    >
      <option value="en">English</option>
      <option value="id">Indonesia</option>
    </select>
  )
}
