"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

type FaqItem = { q: string; a: string }

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

function FaqRow({ item, index, open, onToggle }: { item: FaqItem; index: number; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#e6e6e6] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span
          className={`font-display text-[16px] font-[600] tracking-[-0.005em] transition-colors duration-200 sm:text-[18px] ${
            open ? "text-[#008060]" : "text-ink group-hover:text-[#008060]"
          }`}
        >
          {item.q}
        </span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            open ? "rotate-45 border-[#008060] bg-[#008060] text-white" : "border-[#d3ddd8] text-shade-60 group-hover:border-[#008060]"
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>

      {/* Animated expand via grid-rows trick */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-10 text-[14px] leading-[1.7] text-shade-60 sm:text-[15px]">{item.a}</p>
        </div>
      </div>
    </div>
  )
}

export function FaqSection() {
  const t = useTranslations("marketing")
  const items = t.raw("faq.items") as FaqItem[]
  const { ref, inView } = useInView<HTMLDivElement>(0.2)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative overflow-hidden bg-canvas-cream py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(0,128,96,0.06),transparent_70%)]" />

      <div ref={ref} className="relative mx-auto max-w-3xl px-6 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <p
            className={`mk-on-scroll mb-4 inline-flex items-center gap-2 rounded-full border border-[#bddfcc] bg-white px-3.5 py-1.5 text-[12px] font-[600] uppercase tracking-[0.12em] text-[#007a5a] ${inView ? "is-visible" : ""}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#008060] animate-pulse-dot" />
            {t("faq.eyebrow")}
          </p>
          <h2
            className={`mk-on-scroll font-display text-[30px] font-[600] leading-[1.1] tracking-[-0.01em] text-ink sm:text-[40px] lg:text-[44px] ${inView ? "is-visible" : ""}`}
            style={{ "--mk-reveal-delay": "0.1s" } as React.CSSProperties}
          >
            {t("faq.title")}
          </h2>
          <p
            className={`mk-on-scroll mx-auto mt-4 text-[15px] leading-relaxed text-shade-60 ${inView ? "is-visible" : ""}`}
            style={{ "--mk-reveal-delay": "0.15s" } as React.CSSProperties}
          >
            {t("faq.subtitle")}
          </p>
        </div>

        {/* Accordion */}
        <div
          className={`mk-on-scroll rounded-2xl border border-[#e6e6e6] bg-white px-6 sm:px-8 ${inView ? "is-visible" : ""}`}
          style={{ "--mk-reveal-delay": "0.2s" } as React.CSSProperties}
        >
          {items.map((item, i) => (
            <FaqRow
              key={item.q}
              item={item}
              index={i}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
