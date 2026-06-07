"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { formatIDR } from "@/lib/currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Image from "next/image"
import DashboardLoading from "./loading"

interface Stats {
  totalRevenue: number
  totalSales: number
  totalProfit: number
  totalProducts: number
}

interface Sale {
  id: string
  totalAmount: number
  createdAt: string
  user: { name: string }
}

interface Product {
  id: string
  name: string
  stock: number
  minStock: number
}

interface TopSeller {
  productId: string
  name: string
  totalSold: number
  percentage: number
}

export default function DashboardPage() {
  const t = useTranslations("dashboard")
  const tCommon = useTranslations("common")
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalSales: 0, totalProfit: 0, totalProducts: 0 })
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [topSellers, setTopSellers] = useState<TopSeller[]>([])
  const [period, setPeriod] = useState("today")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "en"

  const isCashier = session?.user?.role === "CASHIER"

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, productsRes, topSellersRes] = await Promise.all([
          fetch("/api/sales"),
          fetch("/api/products"),
          fetch(`/api/sales/top-sellers?period=${period}`)
        ])
        const salesData = await salesRes.json()
        const sales: Sale[] = salesData.sales || []
        const productsData = await productsRes.json()
        const products: Product[] = Array.isArray(productsData) ? productsData : []
        const topSellersJson = await topSellersRes.json()
        const topSellersData: TopSeller[] = Array.isArray(topSellersJson) ? topSellersJson : []

        const now = new Date()
        let filteredSales = sales
        
        // Custom date range filter
        if (period === "custom" && (dateFrom || dateTo)) {
          filteredSales = sales.filter(s => {
            const saleDate = new Date(s.createdAt)
            const matchFrom = !dateFrom || saleDate >= new Date(dateFrom)
            const matchTo = !dateTo || saleDate <= new Date(new Date(dateTo).setHours(23, 59, 59, 999))
            return matchFrom && matchTo
          })
        } else {
          // Predefined period filters
          if (period === "today") filteredSales = sales.filter(s => new Date(s.createdAt).toDateString() === now.toDateString())
          else if (period === "week") filteredSales = sales.filter(s => new Date(s.createdAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
          else if (period === "month") filteredSales = sales.filter(s => new Date(s.createdAt) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
        }

        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0)
        setStats({ totalRevenue, totalSales: filteredSales.length, totalProfit: totalRevenue * 0.4, totalProducts: products.length })
        setRecentSales(filteredSales.slice(0, 4))
        setLowStockProducts(products.filter(p => p.stock <= p.minStock).slice(0, 3))
        setTopSellers(topSellersData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
        setFilterLoading(false)
      }
    }
    fetchData()
  }, [period, dateFrom, dateTo])

  if (loading || filterLoading) return <DashboardLoading />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-[500] text-[28px] leading-[1.28] tracking-[0.42px] text-ink dark:text-on-dark">
              {t("title")}
            </h1>
            <p className="font-[500] text-[14px] leading-[1.49] tracking-[0.28px] text-shade-50 dark:text-shade-40">
              {t("welcome")}
            </p>
          </div>
          <Select value={period} onValueChange={(v) => { 
            setFilterLoading(true); 
            setPeriod(v);
            if (v !== "custom") {
              setDateFrom("");
              setDateTo("");
            }
          }}>
            <SelectTrigger className="w-full sm:w-40 justify-start gap-2">
              <Calendar className="w-4 h-4 text-shade-50 dark:text-shade-40 flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t("today")}</SelectItem>
              <SelectItem value="week">{t("thisWeek")}</SelectItem>
              <SelectItem value="month">{t("thisMonth")}</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {period === "custom" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-end">
            <div className="relative w-full sm:w-52">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shade-50 dark:text-shade-40 pointer-events-none z-10" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-10 pl-10 bg-canvas-cream dark:bg-canvas-night/50 border-hairline-light dark:border-hairline-dark dark:[color-scheme:dark]"
                placeholder="From"
              />
            </div>
            <span className="hidden sm:block text-shade-50 dark:text-shade-40">to</span>
            <div className="relative w-full sm:w-52">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shade-50 dark:text-shade-40 pointer-events-none z-10" />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-10 pl-10 bg-canvas-cream dark:bg-canvas-night/50 border-hairline-light dark:border-hairline-dark dark:[color-scheme:dark]"
                placeholder="To"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="h-10 w-full sm:w-auto"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!isCashier && (
          <div className="bg-canvas-light dark:bg-canvas-night-elevated p-5 rounded-xl elevation-3 dark:elevation-1">
            <p className="font-[400] text-[12px] leading-[1.2] tracking-[0.72px] uppercase text-shade-50 dark:text-shade-40">
              {t("totalRevenue")}
            </p>
            <p className="font-display font-[500] text-[28px] leading-[1.28] tracking-[0.42px] text-ink dark:text-on-dark mt-1">
              {formatIDR(stats.totalRevenue)}
            </p>
            <p className="font-[550] text-sm text-aloe-10 dark:text-aloe-10 mt-2">
              +14.2% {t("vsYesterday")}
            </p>
          </div>
        )}
        <div className="bg-canvas-light dark:bg-canvas-night-elevated p-5 rounded-xl elevation-3 dark:elevation-1">
          <p className="font-[400] text-[12px] leading-[1.2] tracking-[0.72px] uppercase text-shade-50 dark:text-shade-40">
            {t("totalTransactions")}
          </p>
          <p className="font-display font-[500] text-[28px] leading-[1.28] tracking-[0.42px] text-ink dark:text-on-dark mt-1">
            {stats.totalSales}
          </p>
          <p className="font-[500] text-[14px] text-shade-50 dark:text-shade-40 mt-2">
            {stats.totalSales > 0 ? `Avg: ${formatIDR(stats.totalRevenue / stats.totalSales)}` : t('noTransactions')}
          </p>
        </div>
        {!isCashier && (
          <div className="bg-canvas-light dark:bg-canvas-night-elevated p-5 rounded-xl elevation-3 dark:elevation-1 sm:col-span-2 lg:col-span-1">
            <p className="font-[400] text-[12px] leading-[1.2] tracking-[0.72px] uppercase text-shade-50 dark:text-shade-40">
              {t("totalProfit")}
            </p>
            <p className="font-display font-[500] text-[28px] leading-[1.28] tracking-[0.42px] text-ink dark:text-on-dark mt-1">
              {formatIDR(stats.totalProfit)}
            </p>
            <p className="font-[500] text-[14px] text-shade-50 dark:text-shade-40 mt-2">
              {stats.totalProducts} {t("productsInCatalog")}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
          <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark flex justify-between items-center">
            <h2 className="font-[550] text-ink dark:text-on-dark">{t("recentSales")}</h2>
            {!isCashier && (
              <a href={`/${locale}/dashboard/reports`} className="font-[400] text-[12px] leading-[1.2] tracking-[0.72px] uppercase text-ink dark:text-on-dark hover:opacity-70">
                {t("viewAll")}
              </a>
            )}
          </div>
          <div className="divide-y divide-hairline-light dark:divide-hairline-dark">
            {recentSales.length === 0 ? (
              <p className="px-5 py-8 text-center text-shade-50 dark:text-shade-40 font-[420] text-sm">{t("noTransactions")}</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="px-5 py-3 flex items-center justify-between hover:bg-shade-30/20 dark:hover:bg-white/5">
                  <div>
                    <p className="font-[550] text-[16px] text-ink dark:text-on-dark">{sale.user.name}</p>
                    <p className="font-[500] text-[13px] text-shade-50 dark:text-shade-40">{new Date(sale.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="font-[550] text-ink dark:text-on-dark">{formatIDR(sale.totalAmount)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!isCashier && lowStockProducts.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border-l-4 border-orange-500">
              <h3 className="font-[550] text-orange-900 dark:text-orange-400 mb-3">{t("lowStockAlert")}</h3>
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-orange-900 dark:text-orange-400">{p.name}</span>
                    <span className="font-[550] text-orange-700 dark:text-orange-400">{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-canvas-light dark:bg-canvas-night-elevated p-5 rounded-xl elevation-3 dark:elevation-1">
            <h3 className="font-[550] text-ink dark:text-on-dark mb-4">{t("topSellers")}</h3>
            <div className="space-y-3">
              {topSellers.length === 0 ? (
                <p className="font-[420] text-sm text-shade-50 dark:text-shade-40 text-center py-4">{t("noData")}</p>
              ) : (
                topSellers.map((item, i) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-shade-30 dark:bg-white/10 rounded-lg flex items-center justify-center font-[400] text-[12px] font-[500] text-shade-50 dark:text-shade-40">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-[550] text-[16px] text-ink dark:text-on-dark">{item.name}</p>
                      <div className="w-full bg-shade-30 dark:bg-white/10 h-1.5 rounded-full mt-1">
                        <div className="bg-ink dark:bg-on-dark h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                    <span className="font-[400] text-[12px] font-[500] text-shade-50 dark:text-shade-40">{item.totalSold}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {!isCashier && (
        <div className="bg-canvas-night text-on-dark rounded-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="p-6 lg:p-8 flex-1 flex flex-col justify-center">
              <h3 className="font-display font-[500] text-[24px] leading-[1.14] tracking-[0.36px]">{t("ctaTitle")}</h3>
              <p className="text-shade-40 mt-2 font-[420] text-sm">{t("ctaDescription")}</p>
              <a href={`/${locale}`} className="mt-4 btn-outline-dark self-start inline-flex">
                {t("exploreFeatures")}
              </a>
            </div>
            <div className="relative w-full lg:w-48 h-40 lg:h-auto flex-shrink-0">
              <Image
                src="/assets/cashier2.jpg"
                alt="CloudPOS Cashier"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
