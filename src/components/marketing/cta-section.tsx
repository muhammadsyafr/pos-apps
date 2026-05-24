import Link from "next/link"
import { useTranslations } from "next-intl"

export function CTASection({ locale }: { locale: string }) {
  const t = useTranslations("marketing")

  return (
    <section id="pricing" className="relative overflow-hidden py-24 bg-[#121416]">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(0,128,96,0.16),transparent_75%)]" />
      <div className="relative mx-auto max-w-4xl px-8 sm:px-12 text-center">
        <h2 className="font-display font-[600] text-[36px] sm:text-[48px] lg:text-[56px] leading-[1.05] tracking-[-0.02em] text-white mb-5">
          {t("cta.title")}
        </h2>
        <p className="mx-auto max-w-2xl font-[400] text-base sm:text-lg leading-relaxed text-[#b8c0bc] mb-10">
          {t("cta.description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center justify-center gap-2.5 bg-[#008060] text-white rounded-full px-10 py-4 font-[600] text-base leading-none hover:bg-[#006e52] transition-colors duration-200"
          >
            {t("cta.button")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="mailto:sales@cloudpos.id"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#333] px-10 py-4 font-[500] text-base leading-none text-[#a0a0a0] hover:text-white hover:border-[#555] transition-all duration-200"
          >
            {t("cta.secondary")}
          </Link>
        </div>
      </div>
    </section>
  )
}
