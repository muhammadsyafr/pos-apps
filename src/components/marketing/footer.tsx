import Link from "next/link"
import { useTranslations } from "next-intl"
import LanguageSwitcher from "@/components/language-switcher"
import { BrandLogo } from "@/components/brand-logo"
import { BRAND_NAME } from "@/lib/brand"

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("marketing")

  const footerLinks = {
    [t("footer.product")]: [
      { href: `/${locale}/login`, label: t("footer.overview") },
      { href: `/${locale}/login`, label: t("footer.pos") },
      { href: `/${locale}/login`, label: t("footer.inventory") },
      { href: `/${locale}/login`, label: t("footer.analytics") },
      { href: "#pricing", label: t("footer.pricing") },
    ],
    [t("footer.company")]: [
      { href: "#about", label: t("footer.about") },
      { href: "mailto:careers@cloudpos.id", label: t("footer.careers") },
      { href: "https://blog.cloudpos.id", label: t("footer.blog") },
      { href: "mailto:hello@cloudpos.id", label: t("footer.contact") },
    ],
    [t("footer.legal")]: [
      { href: "/privacy", label: t("footer.privacy") },
      { href: "/terms", label: t("footer.terms") },
    ],
  }

  return (
    <footer className="bg-[#f5f6f5] border-t border-[#dfe5e1] dark:bg-[#0d1011] dark:border-white/14">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-4 lg:pr-8 min-w-0">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
              <BrandLogo variant="marketing" size={32} />
              <span className="font-display font-[600] text-[20px] text-[#1a1a1a] dark:text-white tracking-[-0.01em]">{BRAND_NAME}</span>
            </Link>
            <p className="text-[14px] text-[#5f6a65] dark:text-[#9ca8a2] leading-[1.7] mb-6">
              {t("footer.brandDescription")}
            </p>
            <LanguageSwitcher />
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-8">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading} className="min-w-0">
                <h4 className="text-[11px] font-[700] tracking-[0.14em] uppercase text-[#6f7a75] dark:text-[#8f9a95] mb-4">
                  {heading}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[15px] leading-[1.5] text-[#18201d] dark:text-[#d5ddd9] hover:text-[#008060] dark:hover:text-[#58c7a9] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#dfe5e1] dark:border-white/14 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#808b86] dark:text-[#8b9792]">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4">
            <a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#8a8a8a] dark:text-[#8b9792] hover:text-[#1a1a1a] dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a aria-label="X" href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-[#8a8a8a] dark:text-[#8b9792] hover:text-[#1a1a1a] dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#8a8a8a] dark:text-[#8b9792] hover:text-[#1a1a1a] dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
