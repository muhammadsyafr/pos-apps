import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { HeroSection } from "@/components/marketing/hero-section"
import { FeatureSection } from "@/components/marketing/feature-section"
import { StatsSection } from "@/components/marketing/stats-section"
import { CTASection } from "@/components/marketing/cta-section"
import { Footer } from "@/components/marketing/footer"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "marketing" })

  return {
    title: `CloudPOS — ${t("heroTitle")}`,
    description: t("heroDescription"),
    openGraph: {
      title: `CloudPOS — ${t("heroTitle")}`,
      description: t("heroDescription"),
      type: "website",
    },
  }
}

export default async function MarketingPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="min-h-screen bg-surface dark:bg-surface">
      <MarketingNav />
      <HeroSection />
      <FeatureSection />
      <StatsSection />
      <CTASection locale={locale} />
      <Footer locale={locale} />
    </div>
  )
}
