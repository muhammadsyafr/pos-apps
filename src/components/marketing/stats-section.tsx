"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

const stats = [
  { key: "transactions", value: 2.4, suffix: "M+", decimals: 1 },
  { key: "uptime", value: 99.9, suffix: "%", decimals: 1 },
  { key: "stores", value: 500, suffix: "+", decimals: 0 },
  { key: "cities", value: 120, suffix: "+", decimals: 0 },
]

function AnimatedCounter({ target, decimals, suffix }: { target: number; decimals: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
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
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(eased * target)
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count.toFixed(decimals)}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  const t = useTranslations("marketing")

  return (
    <section className="relative py-24 bg-canvas-night text-on-dark overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-[500] text-[18px] leading-[1.25] tracking-[0.72px] text-shade-40">
            {t("stats.title")}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center">
              <div className="font-display font-[330] text-[48px] sm:text-[55px] lg:text-[70px] leading-[1.0] text-on-dark">
                <AnimatedCounter target={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </div>
              <div className="mt-2 font-[400] text-[12px] leading-[1.2] tracking-[0.72px] uppercase text-shade-50">
                {t(`stats.${stat.key}` as any)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
