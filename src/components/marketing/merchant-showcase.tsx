import { useTranslations } from "next-intl"

const stores = [
  { name: "Kedai Kopi Nusantara", category: "Coffee Shop", emoji: "☕" },
  { name: "Butik Fashion Indonesia", category: "Fashion Retail", emoji: "👗" },
  { name: "Toko Elektronik Jaya", category: "Electronics", emoji: "📱" },
  { name: "Restoran Seafood Mas", category: "Restaurant", emoji: "🍜" },
  { name: "Mini Market Sejahtera", category: "Grocery", emoji: "🛒" },
  { name: "Apotek Sehat Farma", category: "Pharmacy", emoji: "💊" },
  { name: "Toko Bangunan Makmur", category: "Hardware", emoji: "🔧" },
  { name: "Cafe & Space Co.", category: "Cafe", emoji: "🧋" },
]

export function MerchantShowcase() {
  const t = useTranslations("marketing")

  return (
    <section className="relative py-20 bg-canvas-cream overflow-hidden">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[13px] font-[500] tracking-[0.12em] uppercase text-shade-60 mb-4">
            {t("merchant.eyebrow")}
          </p>
          <h2 className="font-display font-[600] text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.1] tracking-[-0.01em] text-ink max-w-2xl mx-auto">
            {t("merchant.title")}
          </h2>
        </div>

        {/* Merchant grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {stores.map((store, i) => (
            <div
              key={store.name}
              className="group bg-[#fafafa] rounded-xl p-5 border border-[#ededed] hover:border-[#008060]/30 hover:shadow-md transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#008060]/10 flex items-center justify-center text-xl shrink-0">
                  {store.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-[600] text-[#1a1a1a] truncate group-hover:text-[#008060] transition-colors">
                    {store.name}
                  </p>
                  <p className="text-[12px] text-[#8a8a8a]">{store.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
          <div className="mt-10 flex items-center justify-center gap-2 text-[13px] text-shade-50">
          <svg className="w-4 h-4 text-[#008060]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t("merchant.note")}</span>
        </div>
      </div>
    </section>
  )
}
