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
    <footer className="relative bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-surface-container-high">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white signature-gradient">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-black font-headline tracking-tight text-on-surface">
                CloudPOS
              </span>
            </div>
            <p className="text-sm text-on-surface-variant/50 leading-relaxed max-w-xs">
              Enterprise-grade point of sale and inventory management for Indonesian businesses.
            </p>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-on-surface/40 mb-4">
              {t("footer.product")}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-on-surface/40 mb-4">
              {t("footer.company")}
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-on-surface/40 mb-4">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-surface-container-high">
          <p className="text-xs text-on-surface-variant/30 text-center">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}
