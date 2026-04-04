"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { formatIDR } from "@/lib/currency"

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

export default function DashboardPage() {
  const t = useTranslations("dashboard")
  const tCommon = useTranslations("common")
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalSales: 0, totalProfit: 0, totalProducts: 0 })
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [period, setPeriod] = useState("today")
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "en"

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, productsRes] = await Promise.all([fetch("/api/sales"), fetch("/api/products")])
        const sales: Sale[] = await salesRes.json()
        const products: Product[] = await productsRes.json()

        const now = new Date()
        let filteredSales = sales
        if (period === "today") filteredSales = sales.filter(s => new Date(s.createdAt).toDateString() === now.toDateString())
        else if (period === "week") filteredSales = sales.filter(s => new Date(s.createdAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        else if (period === "month") filteredSales = sales.filter(s => new Date(s.createdAt) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))

        const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0)
        setStats({ totalRevenue, totalSales: filteredSales.length, totalProfit: totalRevenue * 0.4, totalProducts: products.length })
        setRecentSales(filteredSales.slice(0, 4))
        setLowStockProducts(products.filter(p => p.stock <= p.minStock).slice(0, 3))
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t("title")}</h1>
          <p className="text-slate-500">{t("welcome")}</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
          <option value="today">{t("today")}</option>
          <option value="week">{t("thisWeek")}</option>
          <option value="month">{t("thisMonth")}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("totalRevenue")}</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{formatIDR(stats.totalRevenue)}</p>
          <p className="text-xs text-green-600 font-bold mt-2">+14.2% {t("vsYesterday")}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("totalTransactions")}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalSales}</p>
          <p className="text-xs text-slate-500 mt-2">{stats.totalSales > 0 ? `Avg: ${formatIDR(stats.totalRevenue / stats.totalSales)}` : t('noTransactions')}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("totalProfit")}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatIDR(stats.totalProfit)}</p>
          <p className="text-xs text-slate-500 mt-2">{stats.totalProducts} {t("productsInCatalog")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">{t("recentSales")}</h2>
            <a href={`/${locale}/dashboard/reports`} className="text-xs font-bold text-blue-600">{t("viewAll")}</a>
          </div>
          <div className="divide-y divide-slate-50">
            {recentSales.length === 0 ? (
              <p className="px-5 py-8 text-center text-slate-500 text-sm">{t("noTransactions")}</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{sale.user.name}</p>
                    <p className="text-xs text-slate-500">{new Date(sale.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="font-bold text-slate-900">{formatIDR(sale.totalAmount)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          {lowStockProducts.length > 0 && (
            <div className="bg-orange-50 p-5 rounded-xl border-l-4 border-orange-500">
              <h3 className="font-bold text-orange-900 mb-3">{t("lowStockAlert")}</h3>
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-orange-900">{p.name}</span>
                    <span className="font-bold text-orange-700">{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">{t("topSellers")}</h3>
            <div className="space-y-3">
              {["Coffee", "Sandwich", "Chips", "Soda"].map((name, i) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${90 - i * 20}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 lg:p-8 text-center lg:text-left">
        <h3 className="text-xl font-black text-white">{t("ctaTitle")}</h3>
        <p className="text-slate-400 mt-2 text-sm">{t("ctaDescription")}</p>
        <button className="mt-4 px-6 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100">{t("exploreFeatures")}</button>
      </div>
    </div>
  )
}
