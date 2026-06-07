"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

const stats = [
  { value: 2.4, suffix: "M+", label: "Transactions processed", decimals: 1 },
  { value: 99.9, suffix: "%", label: "Uptime guarantee", decimals: 1 },
  { value: 500, suffix: "+", label: "Active stores", decimals: 0 },
  { value: 120, suffix: "+", label: "Cities covered", decimals: 0 },
]

function AnimatedCounter({ target, decimals, suffix }: { target: number; decimals: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          const duration = 2000
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)
            setCount(eased * target)
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="font-display font-[700] text-[48px] sm:text-[56px] lg:text-[64px] leading-[1.0] tracking-[-0.02em] text-[#1a1a1a]">
      {count.toFixed(decimals)}{suffix}
    </div>
  )
}

export function StatsSection() {
  const t = useTranslations("marketing")

  const localizedStats = [
    { ...stats[0], label: t("stats.transactions") },
    { ...stats[1], label: t("stats.uptime") },
    { ...stats[2], label: t("stats.stores") },
    { ...stats[3], label: t("stats.cities") },
  ]

  return (
    <section id="about" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        <div className="text-center mb-14">
          <h2 className="font-display font-[600] text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.15] tracking-[-0.01em] text-ink mb-3">
            {t("stats.title")}
          </h2>
          <p className="font-[400] text-base sm:text-lg text-shade-60 mx-auto">
            {t("stats.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {localizedStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter target={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              <p className="text-[14px] text-shade-60 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
