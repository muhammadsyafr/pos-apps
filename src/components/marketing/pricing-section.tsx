import Link from "next/link"
import { useTranslations } from "next-intl"

const CHECK_ICON = (
  <svg className="h-4 w-4 flex-shrink-0 text-[#008060]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
)

type PlanKey = "starter" | "pro" | "enterprise"

const PLANS: { key: PlanKey; popular?: boolean }[] = [
  { key: "starter" },
  { key: "pro", popular: true },
  { key: "enterprise" },
]

export function PricingSection({ locale }: { locale: string }) {
  const t = useTranslations("marketing.pricing")

  return (
    <section id="pricing" className="relative overflow-hidden py-24 bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(65%_45%_at_50%_0%,rgba(0,128,96,0.07),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="text-center mb-14">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#bddfcc] bg-[#f0faf5] px-3 py-1 text-[11px] font-[600] uppercase tracking-[0.12em] text-[#007a5a]">
            {t("eyebrow")}
          </p>
          <h2 className="font-display font-[600] text-[30px] sm:text-[40px] lg:text-[48px] leading-[1.1] tracking-[-0.02em] text-ink mb-4">
            {t("title")}
          </h2>
          <p className="text-base sm:text-lg text-shade-60 mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map(({ key, popular }) => {
            const name = t(`plans.${key}.name`)
            const price = t(`plans.${key}.price`)
            const priceNote = t(`plans.${key}.priceNote`)
            const description = t(`plans.${key}.description`)
            const cta = t(`plans.${key}.cta`)
            const features = t.raw(`plans.${key}.features`) as string[]
            const isEnterprise = key === "enterprise"

            return (
              <div
                key={key}
                className={`relative flex flex-col rounded-2xl p-7 ${
                  popular
                    ? "bg-[#008060] text-white shadow-[0_20px_60px_rgba(0,128,96,0.28)]"
                    : "bg-white border border-[#dde6e1] shadow-sm"
                }`}
              >
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-block rounded-full bg-[#f0faf5] border border-[#b3dbc8] px-3 py-1 text-[11px] font-[700] uppercase tracking-[0.1em] text-[#007a5a]">
                      {t("mostPopular")}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className={`text-[13px] font-[600] uppercase tracking-[0.1em] mb-2 ${popular ? "text-[#a8dfc9]" : "text-[#7a9990]"}`}>
                    {name}
                  </p>
                  <div className="flex items-end gap-1.5 mb-1">
                    <span className={`font-display font-[700] text-[34px] leading-none tracking-[-0.02em] ${popular ? "text-white" : "text-ink"}`}>
                      {price}
                    </span>
                  </div>
                  <p className={`text-[12px] mb-3 ${popular ? "text-[#a8dfc9]" : "text-shade-50"}`}>{priceNote}</p>
                  <p className={`text-[14px] leading-[1.6] ${popular ? "text-[#d1f0e3]" : "text-shade-60"}`}>
                    {description}
                  </p>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      {popular ? (
                        <svg className="h-4 w-4 flex-shrink-0 text-[#7ee8bc] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="mt-0.5">{CHECK_ICON}</span>
                      )}
                      <span className={`text-[14px] ${popular ? "text-[#d1f0e3]" : "text-shade-70"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={isEnterprise ? "mailto:sales@cloudpos.id" : `/${locale}/login`}
                  className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-[600] transition-colors duration-200 ${
                    popular
                      ? "bg-white text-[#008060] hover:bg-[#f0faf5]"
                      : isEnterprise
                      ? "border border-[#cfd8d3] bg-white text-ink hover:border-[#98b9ac]"
                      : "bg-[#008060] text-white hover:bg-[#006e52]"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
