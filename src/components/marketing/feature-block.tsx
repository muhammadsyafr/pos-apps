"use client"

import Link from "next/link"

const featureBlocks = [
  {
    id: "checkout",
    tag: "Lightning Fast",
    title: "Checkout in seconds, not minutes",
    description: "Process any transaction in under 3 seconds. Barcode scanning, QRIS payments, and cash — all in one fluid flow that keeps your line moving.",
    bullets: ["One-tap barcode scanning", "QRIS & cash payments", "Digital receipt delivery"],
    image: (
      <div className="bg-[#f0f7f4] rounded-2xl p-6 border border-[#d4ede5]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-[600] text-[#008060] uppercase tracking-[0.1em]">New Transaction</span>
          <span className="text-[11px] text-[#8a8a8a]">#TRX-4522</span>
        </div>
        <div className="space-y-2 mb-4">
          {[
            { name: "Cappuccino", qty: "x2", price: "Rp 56.000" },
            { name: "Blueberry Muffin", qty: "x1", price: "Rp 28.000" },
          ].map((item) => (
            <div key={item.name} className="flex justify-between py-2 border-b border-[#d4ede5]">
              <span className="text-[14px] text-[#1a1a1a]">{item.qty} {item.name}</span>
              <span className="text-[14px] font-[500] text-[#1a1a1a]">{item.price}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between py-3 border-t-2 border-[#008060]">
          <span className="text-[16px] font-[700] text-[#1a1a1a]">Total</span>
          <span className="text-[18px] font-[700] text-[#008060]">Rp 84.000</span>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 bg-[#008060] text-white rounded-lg py-3 text-center text-[13px] font-[600]">QRIS</div>
          <div className="flex-1 bg-[#fafafa] border border-[#dcdcdc] rounded-lg py-3 text-center text-[13px] font-[500] text-[#1a1a1a]">Cash</div>
        </div>
      </div>
    ),
  },
  {
    id: "intelligence",
    tag: "Real-time Analytics",
    title: "Know your numbers before your shift ends",
    description: "Live dashboards track revenue, margins, and stock levels in real-time. Make decisions based on what's happening right now, not yesterday's reports.",
    bullets: ["Live sales dashboard", "Stock alerts & reordering", "Profit margin tracking"],
    image: (
      <div className="bg-[#1a1a1a] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-[500] text-[#a0a0a0] uppercase tracking-[0.1em]">Revenue Today</span>
          <span className="text-[11px] text-[#27c93f] bg-[#27c93f]/10 px-2 py-0.5 rounded">+23%</span>
        </div>
        <p className="text-[36px] font-[700] mb-4">Rp 12.450K</p>
        <div className="space-y-2">
          {[
            { label: "Coffee", value: 45, color: "#008060" },
            { label: "Food", value: 30, color: "#7c3aed" },
            { label: "Beverages", value: 25, color: "#f59e0b" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-[11px] text-[#a0a0a0] w-16">{item.label}</span>
              <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="text-[11px] font-[500] text-[#a0a0a0] w-8">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "inventory",
    tag: "Smart Inventory",
    title: "Never run out of stock again",
    description: "Low-stock alerts, auto-reorder suggestions, and multi-warehouse tracking keep your shelves full and your business running smoothly.",
    bullets: ["Automatic low-stock alerts", "Multi-store inventory sync", "Purchase order management"],
    image: (
      <div className="bg-[#fffbeb] rounded-2xl p-5 border border-[#fde68a]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className="text-[13px] font-[600] text-[#92400e]">Low Stock Alert</span>
        </div>
        <div className="space-y-2">
          {[
            { name: "Arabica Coffee Beans", stock: 12, min: 20 },
            { name: "Cappuccino Cups (L)", stock: 5, min: 50 },
            { name: "Blueberry Syrup", stock: 3, min: 10 },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between py-2 border-b border-[#fde68a]/50 last:border-0">
              <div>
                <p className="text-[13px] font-[500] text-[#1a1a1a]">{item.name}</p>
                <p className="text-[11px] text-[#92400e]">Min: {item.min}</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-[600] text-[#dc2626]">{item.stock} left</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 bg-[#f59e0b] text-white rounded-lg py-2.5 text-[12px] font-[600]">
          Create Purchase Order
        </button>
      </div>
    ),
  },
]

export function FeatureBlock() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16 space-y-24">
        {featureBlocks.map((block, i) => {
          const isEven = i % 2 === 0

          return (
            <div
              key={block.id}
              className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${!isEven ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Content */}
              <div className="flex-1 max-w-lg">
                <p className="text-[12px] font-[600] tracking-[0.15em] uppercase text-[#008060] mb-4">
                  {block.tag}
                </p>
                <h2 className="font-display font-[600] text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.1] tracking-[-0.01em] text-[#1a1a1a] mb-5">
                  {block.title}
                </h2>
                <p className="font-[400] text-base sm:text-lg leading-[1.6] text-[#424242] mb-6">
                  {block.description}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {block.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3 text-[14px] sm:text-[15px] text-[#1a1a1a]">
                      <svg className="w-4 h-4 text-[#008060] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-[#008060] font-[600] text-[14px] hover:gap-3 transition-all duration-200"
                >
                  Learn more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Visual */}
              <div className="flex-1 w-full max-w-lg lg:max-w-none">
                {block.image}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
