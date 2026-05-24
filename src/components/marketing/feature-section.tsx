import { useTranslations } from "next-intl"

const icons = [
  <svg key="fast" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>,
  <svg key="analytics" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>,
  <svg key="secure" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>,
  <svg key="inventory" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>,
  <svg key="offline" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
  </svg>,
  <svg key="multi" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
]

const featureKeys = ["fast", "analytics", "secure", "inventory", "offline", "multiStore"] as const

const iconColors = [
  "text-primary bg-primary/10 dark:bg-primary/20",
  "text-secondary bg-secondary/10 dark:bg-secondary/20",
  "text-tertiary bg-tertiary/10 dark:bg-tertiary/20",
  "text-[#8b5cf6] bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20",
  "text-[#10b981] bg-[#10b981]/10 dark:bg-[#10b981]/20",
  "text-[#f59e0b] bg-[#f59e0b]/10 dark:bg-[#f59e0b]/20",
]

export function FeatureSection() {
  const t = useTranslations("marketing")

  return (
    <section id="features" className="relative py-32 bg-surface-container-low dark:bg-surface-container-low overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(0,61,155,0.04),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(96,165,250,0.03),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-headline tracking-tight text-on-surface">
            {t("features.title")}
          </h2>
          <p className="text-lg text-on-surface-variant/60 max-w-xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((key, i) => (
            <div
              key={key}
              className="group relative bg-surface-container-lowest dark:bg-surface-container-lowest rounded-3xl p-8 hover:-translate-y-1 transition-all duration-500"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${iconColors[i]}`}>
                {icons[i]}
              </div>
              <h3 className="text-xl font-bold font-headline text-on-surface mb-3">
                {t(`features.${key}.title` as any)}
              </h3>
              <p className="text-on-surface-variant/60 leading-relaxed">
                {t(`features.${key}.description` as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
