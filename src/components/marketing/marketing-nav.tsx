"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { BRAND_NAME } from "@/lib/brand"

export function MarketingNav() {
  const params = useParams()
  const locale = params.locale as string
  const { data: session } = useSession()
  const isLoggedIn = !!session
  const t = useTranslations("marketing")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-canvas-cream/90 backdrop-blur-xl border-b border-black/10 shadow-sm"
          : "bg-canvas-cream/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <BrandLogo variant="marketing" size={32} />
          <span className="font-display font-[600] text-[16px] text-ink">{BRAND_NAME}</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-[14px] font-[500] text-shade-60 hover:text-ink transition-colors">
            {t("navFeatures")}
          </Link>
          <Link href="#pricing" className="text-[14px] font-[500] text-shade-60 hover:text-ink transition-colors">
            {t("navPricing")}
          </Link>
          <Link href="#about" className="text-[14px] font-[500] text-shade-60 hover:text-ink transition-colors">
            {t("navAbout")}
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href={isLoggedIn ? `/${locale}/dashboard` : `/${locale}/login`}
            className="inline-flex items-center justify-center bg-[#008060] text-white rounded-full px-6 py-2.5 font-[600] text-sm leading-none hover:bg-[#006e52] transition-colors duration-200"
          >
            {isLoggedIn ? t("navDashboard") : t("navSignIn")}
          </Link>
        </div>
      </div>
    </nav>
  )
}
