"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export function MarketingNav() {
  const params = useParams()
  const locale = params.locale as string
  const { data: session } = useSession()
  const isLoggedIn = !!session
  const t = useTranslations("marketing")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
      <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-surface-container-lowest/85 backdrop-blur-xl border-b border-surface-container-high/50 dark:border-surface-container-high/30"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white signature-gradient shadow-lg shadow-blue-700/25 dark:shadow-blue-900/30 transition-transform duration-300 group-hover:scale-105">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-black font-headline tracking-tight text-on-surface dark:text-on-surface transition-opacity duration-300">
            CloudPOS
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={isLoggedIn ? `/${locale}/dashboard` : `/${locale}/login`}
            className="px-6 py-2.5 signature-gradient text-white rounded-xl font-headline font-bold text-sm shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-700/25 transition-all duration-300"
          >
            {isLoggedIn ? t("navDashboard") : t("navSignIn")}
          </Link>
        </div>
      </div>
    </nav>
  )
}
