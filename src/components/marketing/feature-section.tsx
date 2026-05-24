import { useTranslations } from "next-intl"

const icons = [
  <svg key="fast" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>,
  <svg key="analytics" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>,
  <svg key="secure" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>,
  <svg key="inventory" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>,
  <svg key="offline" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
  </svg>,
  <svg key="multi" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
]

const featureKeys = ["fast", "analytics", "secure", "inventory", "offline", "multiStore"] as const
type FeatureKey = (typeof featureKeys)[number]

export function FeatureSection() {
  const t = useTranslations("marketing")

  return (
    <section id="features" className="relative py-28 bg-canvas-night text-on-dark overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 mk-dot-grid opacity-50" />

      <div className="relative mx-auto max-w-7xl px-8 sm:px-12">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-aloe-10 mb-5">
            <span className="w-5 h-px bg-aloe-10" />
            Capabilities
            <span className="w-5 h-px bg-aloe-10" />
          </div>
          <h2 className="font-display font-[300] text-[40px] sm:text-[52px] lg:text-[64px] leading-[0.95] tracking-[-0.01em] mb-5">
            {t("features.title")}
          </h2>

        </div>

        {/* Feature grid — 3 columns on lg, 2 on sm, 1 on xs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureKeys.map((key: FeatureKey, i) => (
            <div
              key={key}
              className="group relative bg-canvas-night-elevated/60 rounded-2xl p-7 border border-white/[0.04] hover:border-aloe-10/20 transition-all duration-500"
            >
              {/* Number indicator */}
              <div className="font-mono text-[11px] tracking-[0.15em] text-aloe-10/50 mb-5">
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-shade-40 group-hover:text-aloe-10 group-hover:bg-aloe-10/10 group-hover:border-aloe-10/30 transition-all duration-500 mb-5">
                {icons[i]}
              </div>

              {/* Title */}
              <h3 className="font-display font-[500] text-[18px] leading-[1.3] tracking-[-0.01em] mb-3 text-on-dark group-hover:text-aloe-10 transition-colors duration-500">
                {t(`features.${key}.title`)}
              </h3>

              {/* Description */}
              <p className="font-[400] text-sm leading-relaxed text-shade-50 group-hover:text-shade-40 transition-colors duration-500">
                {t(`features.${key}.description`)}
              </p>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-7 right-7 h-px bg-gradient-to-r from-transparent via-aloe-10/0 to-transparent group-hover:via-aloe-10/60 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
