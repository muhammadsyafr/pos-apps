import Link from "next/link"
import { useTranslations } from "next-intl"

export function CTASection({ locale }: { locale: string }) {
  const t = useTranslations("marketing")

  return (
    <section className="relative py-32 bg-surface-container-low dark:bg-surface-container-low overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,61,155,0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(96,165,250,0.04),transparent)]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="relative rounded-3xl bg-surface-container-lowest/50 backdrop-blur-2xl border border-surface-container-high/30 dark:border-surface-container-high/20 p-12 sm:p-16 shadow-[0_24px_64px_rgba(25,28,30,0.04)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.15)]">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline tracking-tight text-on-surface mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-on-surface-variant/60 max-w-lg mx-auto mb-10 leading-relaxed">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/login`}
              className="px-10 py-4 signature-gradient text-white rounded-2xl font-headline font-bold text-lg shadow-lg shadow-blue-700/25 dark:shadow-blue-900/30 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
            >
              {t("cta.button")}
            </Link>
            <Link
              href="#"
              className="px-10 py-4 bg-surface-container-low rounded-2xl font-headline font-bold text-lg text-on-surface hover:bg-surface-container-high transition-all duration-300"
            >
              {t("cta.secondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
