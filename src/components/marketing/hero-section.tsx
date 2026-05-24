"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export function HeroSection() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations("marketing")

  return (
    <section className="relative min-h-screen flex items-center bg-canvas-night text-on-dark overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.03),transparent)]" />

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full -translate-y-1/2 translate-x-1/4" />

      <div className="relative mx-auto max-w-[1440px] w-full px-6 pt-32 pb-20">
        <div className="space-y-16 max-w-4xl">
          <div className="space-y-8 reveal-up stagger-1">
            <div className="pill-tag-mint">
              Now in Beta
            </div>
            <h1 className="font-display font-[330] text-[64px] sm:text-[80px] lg:text-[96px] leading-[1.0] tracking-[2.4px] max-w-3xl">
              {t("heroTitle")}
            </h1>
            <p className="font-[550] text-[18px] leading-[1.56] text-shade-40 max-w-xl">
              {t("heroSubtitle")}
            </p>
            <p className="font-[420] text-[16px] leading-[1.5] text-shade-50 max-w-md">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href={`/${locale}/login`}
                className="btn-outline-dark text-center"
              >
                {t("getStarted")}
              </Link>
              <Link
                href="#features"
                className="text-on-dark/60 hover:text-on-dark text-base font-[420] py-3 px-6 transition-colors"
              >
                {t("viewDemo")} &darr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
