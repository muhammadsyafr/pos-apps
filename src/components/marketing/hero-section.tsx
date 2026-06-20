"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

function useCountUp(target: number, duration = 1400, delay = 600) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const timer = setTimeout(() => {
      const startTime = performance.now()
      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * target))
        if (progress < 1) requestAnimationFrame(step)
        else setCount(target)
      }
      requestAnimationFrame(step)
    }, delay)

    return () => clearTimeout(timer)
  }, [target, duration, delay])

  return count
}

export function HeroSection() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations("marketing")

  const tx = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback)

  const transactions = useCountUp(87, 1400, 700)
  const salesK = useCountUp(12450, 1600, 700)

  const formatSales = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 3).replace(".", ".")}K`
    return `${n}`
  }

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-canvas-cream pt-24 pb-12 lg:pt-28 lg:pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_88%_8%,rgba(0,128,96,0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),rgba(255,255,255,0.96))]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid items-center gap-10 lg:gap-14 lg:grid-cols-[1.02fr_1fr]">
          <div className="max-w-2xl reveal-up stagger-1">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bddfcc] bg-white px-3 py-1 text-[11px] font-[600] uppercase tracking-[0.12em] text-[#007a5a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#008060] animate-pulse-dot" />
              {tx("heroBadge", "CloudPOS - Point of Sale untuk Indonesia")}
            </p>

            <h1 className="font-display text-[42px] font-[600] leading-[1.02] tracking-[-0.025em] text-ink sm:text-[56px] lg:text-[74px]">
              {t("heroTitle")}
            </h1>

            <p className="mt-5 text-base leading-[1.7] text-shade-60 sm:text-[18px]">
              {t("heroDescription")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#008060] px-7 py-3.5 text-sm font-[600] text-white transition-colors duration-200 hover:bg-[#006e52]"
              >
                {t("getStarted")}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-[#cfd8d3] bg-white px-7 py-3.5 text-sm font-[600] text-ink transition-colors duration-200 hover:border-[#98b9ac]"
              >
                {t("viewDemo")}
              </Link>
            </div>

            <p className="mt-4 text-[13px] text-shade-50">{tx("heroNoCard", "Tanpa kartu kredit. Mulai gratis hari ini.")}</p>
          </div>

          <div className="relative reveal-up stagger-2">
            <div className="absolute -inset-3 rounded-[30px] bg-[radial-gradient(80%_80%_at_65%_20%,rgba(0,128,96,0.2),transparent)] blur-2xl" />

            <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_90px_rgba(0,0,0,0.14)]">
              <div className="flex items-center gap-2 border-b border-[#e7ece9] bg-[#f9fbfa] px-5 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                <div className="mx-4 h-5 flex-1 rounded bg-[#ecf1ee]" />
              </div>

              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#81908a]">{tx("heroDashboard", "Dasbor")}</p>
                    <p className="text-[22px] font-[650] tracking-[-0.01em] text-ink">{tx("heroGreeting", "Selamat pagi!")}</p>
                  </div>
                  <div className="rounded-xl border border-[#d8e2dd] bg-[#f8fbf9] px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#86958f]">{tx("heroToday", "Hari ini")}</p>
                    <p className="text-[12px] font-[600] text-ink">May 25, 2026</p>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#dbe8e2] bg-[#f3faf7] p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[#6f827a]">Daily Sales</p>
                    <p className="mt-1 text-[20px] font-[700] text-[#007a5a] tabular-nums">
                      Rp {formatSales(salesK)}
                    </p>
                    <p className="text-[10px] text-[#16a34a]">↑ 23% vs yesterday</p>
                  </div>
                  <div className="rounded-xl border border-[#e3e8e5] bg-[#f8faf9] p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[#7f8c87]">Transactions</p>
                    <p className="mt-1 text-[20px] font-[700] text-ink tabular-nums">{transactions}</p>
                    <p className="text-[10px] text-[#16a34a]">↑ 12% vs yesterday</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[#7f8c87]">{tx("heroRecentTransactions", "Transaksi terbaru")}</p>
                  <div className="space-y-1.5">
                    {[
                      { id: "TRX-4521", item: "2x Latte, 1x Croissant", amount: "Rp 85.000", stagger: "stagger-7" },
                      { id: "TRX-4520", item: "1x Americano, 1x Muffin", amount: "Rp 55.000", stagger: "stagger-8" },
                      { id: "TRX-4519", item: "3x Espresso", amount: "Rp 45.000", stagger: "stagger-9" },
                    ].map((trx) => (
                      <div
                        key={trx.id}
                        className={`flex items-center justify-between rounded-lg px-2 py-2 hover:bg-[#f8fbfa] slide-in-row ${trx.stagger}`}
                      >
                        <div>
                          <p className="text-[13px] font-[600] text-ink">{trx.id}</p>
                          <p className="text-[11px] text-[#83918c]">{trx.item}</p>
                        </div>
                        <p className="text-[13px] font-[650] text-ink">{trx.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-8 rounded-full border border-[#cce4d9] bg-white px-3.5 py-2 shadow-lg sm:right-[-18px] animate-float-badge">
              <p className="text-[10px] text-[#7e8b86]">{tx("heroPayment", "Pembayaran")}</p>
              <p className="text-[12px] font-[700] text-[#007a5a]">{tx("heroPaymentSuccess", "Berhasil")}</p>
            </div>

            <div className="absolute -bottom-5 left-3 rounded-xl bg-[#15201c] px-3.5 py-2.5 shadow-xl sm:left-4 animate-float-badge-delayed">
              <p className="text-[10px] text-[#9db2a9]">{tx("heroRevenueToday", "Pendapatan hari ini")}</p>
              <p className="text-[14px] font-[700] text-white">Rp 12.4M</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
