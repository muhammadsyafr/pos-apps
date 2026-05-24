import { useTranslations } from "next-intl"

const emojis = ["☕", "👗", "📱"]

export function Testimonials() {
  const t = useTranslations("marketing")

  const testimonials = [
    {
      quote: t("testimonials.items.1.quote"),
      name: t("testimonials.items.1.name"),
      business: t("testimonials.items.1.business"),
      emoji: emojis[0],
    },
    {
      quote: t("testimonials.items.2.quote"),
      name: t("testimonials.items.2.name"),
      business: t("testimonials.items.2.business"),
      emoji: emojis[1],
    },
    {
      quote: t("testimonials.items.3.quote"),
      name: t("testimonials.items.3.name"),
      business: t("testimonials.items.3.business"),
      emoji: emojis[2],
    },
  ]

  return (
    <section className="py-24 bg-canvas-cream overflow-hidden">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        <div className="text-center mb-14">
          <p className="text-[12px] font-[600] tracking-[0.15em] uppercase text-shade-60 mb-4">
            {t("testimonials.eyebrow")}
          </p>
          <h2 className="font-display font-[600] text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.1] tracking-[-0.01em] text-ink">
            {t("testimonials.title")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-[#fafafa] rounded-2xl p-7 border border-[#ededed] hover:border-[#008060]/30 transition-all duration-300"
            >
              {/* Quote icon */}
              <svg className="w-8 h-8 text-[#008060]/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              <p className="text-[15px] leading-[1.65] text-[#1a1a1a] mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#008060]/10 flex items-center justify-center text-lg">
                  {t.emoji}
                </div>
                <div>
                  <p className="text-[14px] font-[600] text-[#1a1a1a]">{t.name}</p>
                  <p className="text-[12px] text-[#6b6b6b]">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
