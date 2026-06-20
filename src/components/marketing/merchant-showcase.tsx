"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

type Store = { name: string; category: string; emoji: string }

const stores: Store[] = [
  { name: "Kedai Kopi Nusantara", category: "Coffee Shop", emoji: "☕" },
  { name: "Butik Fashion Indonesia", category: "Fashion Retail", emoji: "👗" },
  { name: "Toko Elektronik Jaya", category: "Electronics", emoji: "📱" },
  { name: "Restoran Seafood Mas", category: "Restaurant", emoji: "🍜" },
  { name: "Mini Market Sejahtera", category: "Grocery", emoji: "🛒" },
  { name: "Apotek Sehat Farma", category: "Pharmacy", emoji: "💊" },
  { name: "Toko Bangunan Makmur", category: "Hardware", emoji: "🔧" },
  { name: "Cafe & Space Co.", category: "Cafe", emoji: "🧋" },
  { name: "Warung Sate Pak Budi", category: "Street Food", emoji: "🍢" },
  { name: "Salon Cantik Bali", category: "Beauty", emoji: "💇" },
  { name: "Toko Buku Pintar", category: "Bookstore", emoji: "📚" },
  { name: "Bengkel Motor Cepat", category: "Workshop", emoji: "🏍️" },
]

const rowA = stores.slice(0, 6)
const rowB = stores.slice(6)

/** Reveal-on-scroll: adds `is-visible` once the element enters the viewport. */
function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

function StoreCard({ store }: { store: Store }) {
  return (
    <div className="group flex w-[248px] shrink-0 items-start gap-3 rounded-xl border border-[#ededed] bg-[#fafafa] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#008060]/30 hover:bg-white hover:shadow-[0_12px_30px_rgba(0,128,96,0.10)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#008060]/10 text-xl transition-transform duration-300 group-hover:scale-110">
        {store.emoji}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-[600] text-[#1a1a1a] transition-colors group-hover:text-[#008060]">
          {store.name}
        </p>
        <p className="text-[12px] text-[#8a8a8a]">{store.category}</p>
      </div>
    </div>
  )
}

function MarqueeRow({ items, duration, reverse }: { items: Store[]; duration: string; reverse?: boolean }) {
  return (
    <div className="mk-marquee w-full overflow-hidden py-2">
      <div
        className="mk-marquee-track gap-4"
        style={{ "--mk-marquee-dur": duration, "--mk-marquee-dir": reverse ? "reverse" : "normal" } as React.CSSProperties}
      >
        {[...items, ...items].map((store, i) => (
          <StoreCard key={`${store.name}-${i}`} store={store} />
        ))}
      </div>
    </div>
  )
}

export function MerchantShowcase() {
  const t = useTranslations("marketing")
  const { ref, inView } = useInView<HTMLDivElement>(0.25)

  return (
    <section className="relative overflow-hidden bg-canvas-cream py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(0,128,96,0.08),transparent_70%)]" />

      <div ref={ref} className="relative mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-14 text-center">
          <p
            className={`mk-on-scroll mb-5 inline-flex items-center gap-2 rounded-full border border-[#bddfcc] bg-white px-3.5 py-1.5 text-[12px] font-[600] uppercase tracking-[0.12em] text-[#007a5a] ${inView ? "is-visible" : ""}`}
          >
            <span className="h-2 w-2 rounded-full bg-[#008060] animate-pulse-dot" />
            {t("merchant.eyebrow")}
          </p>
          <h2
            className={`mk-on-scroll mx-auto max-w-2xl font-display text-[32px] font-[600] leading-[1.1] tracking-[-0.01em] text-ink sm:text-[40px] lg:text-[48px] ${inView ? "is-visible" : ""}`}
            style={{ "--mk-reveal-delay": "0.1s" } as React.CSSProperties}
          >
            {t("merchant.title")}
          </h2>
        </div>

        {/* Dual-row marquee */}
        <div
          className={`mk-on-scroll space-y-2 ${inView ? "is-visible" : ""}`}
          style={{ "--mk-reveal-delay": "0.2s" } as React.CSSProperties}
        >
          <MarqueeRow items={rowA} duration="48s" />
          <MarqueeRow items={rowB} duration="38s" reverse />
        </div>

        {/* Bottom note */}
        <div
          className={`mk-on-scroll mt-12 flex items-center justify-center gap-2 text-[13px] text-shade-50 ${inView ? "is-visible" : ""}`}
          style={{ "--mk-reveal-delay": "0.3s" } as React.CSSProperties}
        >
          <svg className="h-4 w-4 text-[#008060]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t("merchant.note")}</span>
        </div>
      </div>
    </section>
  )
}
