"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export function HeroSection() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations("marketing")

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-surface dark:bg-surface" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,61,155,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(96,165,250,0.06),transparent)]" />

      {/* Diagonal accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -translate-y-1/2 translate-x-1/4 dark:from-primary/5" />

      {/* Floating geometry */}
      <div className="absolute top-1/4 left-[15%] w-2 h-2 rounded-full bg-primary/30 dark:bg-primary/20 animate-[float_6s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 right-[20%] w-3 h-3 rounded-full bg-primary/25 dark:bg-primary/15 animate-[float_8s_ease-in-out_infinite_1s]" />
      <div className="absolute bottom-1/4 left-[25%] w-2 h-2 rounded-full bg-primary/20 dark:bg-primary/10 animate-[float_7s_ease-in-out_infinite_0.5s]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 reveal-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold tracking-widest uppercase text-primary dark:text-primary-container">
              <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary-container animate-pulse" />
              Now in Beta
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black font-headline tracking-tight text-on-surface leading-[0.95]">
              {t("heroTitle")}
            </h1>
            <p className="text-xl sm:text-2xl text-on-surface-variant font-headline font-medium tracking-tight max-w-lg">
              {t("heroSubtitle")}
            </p>
            <p className="text-base text-on-surface-variant/70 max-w-md leading-relaxed">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href={`/${locale}/login`}
                className="px-8 py-4 signature-gradient text-white rounded-2xl font-headline font-bold text-lg shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-700/30 transition-all duration-300 text-center"
              >
                {t("getStarted")}
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-surface-container-low dark:bg-surface-container-low rounded-2xl font-headline font-bold text-lg text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-all duration-300 text-center"
              >
                {t("viewDemo")}
              </Link>
            </div>
          </div>

          <div className="reveal-right hidden lg:block">
            <div className="relative">
              {/* Glass card stack */}
              <div className="relative w-full aspect-[4/3] rounded-3xl bg-surface-container-lowest/40 backdrop-blur-xl border border-surface-container-high/30 dark:border-surface-container-high/20 p-8 rotate-1 shadow-[0_24px_64px_rgba(25,28,30,0.08)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
                <div className="absolute inset-4 rounded-2xl bg-surface-container-low/60" />
                <div className="relative h-full rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-tertiary/60" />
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    <div className="w-2 h-2 rounded-full bg-secondary/40" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-1/3 rounded-full bg-surface-container-high" />
                    <div className="h-4 w-2/3 rounded-full bg-surface-container-high" />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="rounded-xl bg-surface-container-low p-4 space-y-2">
                        <div className="h-1.5 w-1/2 rounded-full bg-primary/20" />
                        <div className="h-6 w-3/4 rounded-full bg-primary/10" />
                      </div>
                      <div className="rounded-xl bg-surface-container-low p-4 space-y-2">
                        <div className="h-1.5 w-1/2 rounded-full bg-secondary/20" />
                        <div className="h-6 w-3/4 rounded-full bg-secondary/10" />
                      </div>
                      <div className="rounded-xl bg-surface-container-low p-4 space-y-2">
                        <div className="h-1.5 w-1/2 rounded-full bg-tertiary/20" />
                        <div className="h-6 w-3/4 rounded-full bg-tertiary/10" />
                      </div>
                      <div className="rounded-xl bg-surface-container-low p-4 space-y-2">
                        <div className="h-1.5 w-1/2 rounded-full bg-primary/20" />
                        <div className="h-6 w-3/4 rounded-full bg-primary/10" />
                      </div>
                    </div>
                    <div className="h-3 w-full rounded-full bg-surface-container-high mt-2" />
                    <div className="h-3 w-2/3 rounded-full bg-surface-container-high" />
                  </div>
                </div>
              </div>
              {/* Second glass card offset */}
              <div className="absolute -bottom-8 -right-8 w-2/3 aspect-[4/3] rounded-3xl bg-surface-container-lowest/30 backdrop-blur-lg border border-surface-container-high shadow-lg -rotate-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
