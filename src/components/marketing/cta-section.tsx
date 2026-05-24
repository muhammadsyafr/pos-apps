import Link from "next/link"
import { useTranslations } from "next-intl"

export function CTASection({ locale }: { locale: string }) {
  const t = useTranslations("marketing")

  return (
    <section className="relative py-32 bg-canvas-night text-on-dark overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(255,255,255,0.02),transparent)]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="bg-canvas-night-elevated rounded-2xl p-12 sm:p-16 elevation-1">
          <h2 className="font-display font-[330] text-[48px] sm:text-[55px] lg:text-[70px] leading-[1.0] mb-8">
            {t("cta.title")}
          </h2>
          <p className="font-[420] text-[16px] leading-[1.5] text-shade-40 max-w-lg mx-auto mb-12">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/login`}
              className="btn-outline-dark"
            >
              {t("cta.button")}
            </Link>
            <Link
              href="#"
              className="text-on-dark/60 hover:text-on-dark text-base font-[420] py-3 px-6 transition-colors"
            >
              {t("cta.secondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
