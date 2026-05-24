import Link from "next/link"
import { useTranslations } from "next-intl"
import LanguageSwitcher from "@/components/language-switcher"

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("marketing")

  const productLinks = [
    { href: `/${locale}/login`, label: t("footer.overview") },
    { href: `/${locale}/login`, label: t("footer.pos") },
    { href: `/${locale}/login`, label: t("footer.inventory") },
    { href: `/${locale}/login`, label: t("footer.analytics") },
    { href: "#", label: t("footer.pricing") },
  ]

  const companyLinks = [
    { href: "#", label: t("footer.about") },
    { href: "#", label: t("footer.careers") },
    { href: "#", label: t("footer.blog") },
    { href: "#", label: t("footer.contact") },
  ]

  const legalLinks = [
    { href: "#", label: t("footer.privacy") },
    { href: "#", label: t("footer.terms") },
  ]

  return (
    <footer className="bg-canvas-night text-on-dark">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-display font-[500] text-[18px] tracking-[0.72px]">
                CloudPOS
              </span>
            </div>
            <p className="font-[420] text-[16px] leading-[1.5] text-shade-40 max-w-xs">
              Enterprise-grade point of sale and inventory management for Indonesian businesses.
            </p>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>

          <div>
            <h4 className="font-[400] text-[12px] leading-[1.2] tracking-[0.72px] uppercase text-shade-50 mb-4">
              {t("footer.product")}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-[500] text-[14px] leading-[1.49] tracking-[0.28px] text-link-cool-1 hover:text-on-dark transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-[400] text-[12px] leading-[1.2] tracking-[0.72px] uppercase text-shade-50 mb-4">
              {t("footer.company")}
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-[500] text-[14px] leading-[1.49] tracking-[0.28px] text-link-cool-2 hover:text-on-dark transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-[400] text-[12px] leading-[1.2] tracking-[0.72px] uppercase text-shade-50 mb-4">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-[500] text-[14px] leading-[1.49] tracking-[0.28px] text-link-cool-3 hover:text-on-dark transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-hairline-dark">
          <p className="font-[500] text-[13px] leading-[1.5] tracking-[-0.13px] text-shade-40 text-center">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}
