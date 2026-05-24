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
          ? "bg-canvas-night/90 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-6 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 transition-transform duration-300 group-hover:scale-105">
            <svg className="w-5 h-5 text-on-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-[500] text-[18px] tracking-[0.72px] text-on-dark transition-opacity duration-300">
            CloudPOS
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={isLoggedIn ? `/${locale}/dashboard` : `/${locale}/login`}
            className="btn-outline-dark"
          >
            {isLoggedIn ? t("navDashboard") : t("navSignIn")}
          </Link>
        </div>
      </div>
    </nav>
  )
}
