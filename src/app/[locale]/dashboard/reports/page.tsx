"use client"

import { useState, useEffect } from "react"
import React from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileText, Download, Calendar, ChevronDown, ChevronRight } from "lucide-react"
import * as XLSX from "xlsx"
import { useTranslations } from "next-intl"
import { formatIDR } from "@/lib/currency"
import { useSession } from "next-auth/react"

interface Sale {
  id: string
  totalAmount: number
  cashPaid: number
  changeGiven: number
  paymentMethod: string
  createdAt: string
  user: { name: string }
  items: { product: { name: string; costPrice: number }; quantity: number; price: number }[]
}

export default function ReportsPage() {
  const t = useTranslations("reports")
  const tCommon = useTranslations("common")
  const { data: session } = useSession()
  const isCashier = session?.user?.role === "CASHIER"
  const [sales, setSales] = useState<Sale[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [expandedSale, setExpandedSale] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch("/api/sales")
        const data = await res.json()
        setSales(data)
      } catch (error) {
        console.error("Failed to fetch sales:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSales()
  }, [])

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.user.name.toLowerCase().includes(search.toLowerCase())

    const saleDate = new Date(s.createdAt)
    const fromDate = dateFrom ? new Date(dateFrom) : null
    const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null

    const matchesFrom = fromDate ? saleDate >= fromDate : true
    const matchesTo = toDate ? saleDate <= toDate : true

    return matchesSearch && matchesFrom && matchesTo
  })

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0)
  const totalProfit = filteredSales.reduce((sum, sale) => {
    return (
      sum +
      sale.items.reduce((itemSum, item) => {
        const cost = item.product.costPrice || 0
        return itemSum + (item.price - cost) * item.quantity
      }, 0)
    )
  }, 0)

  const exportToXLSX = () => {
    const exportData = filteredSales.map((sale) => ({
      Date: new Date(sale.createdAt).toLocaleString(),
      "Transaction ID": sale.id,
      Cashier: sale.user.name,
      Items: sale.items.map((i) => `${i.product.name} x${i.quantity}`).join(", "),
      "Total Amount (IDR)": sale.totalAmount,
      "Payment Method": sale.paymentMethod,
      "Cash Paid (IDR)": sale.cashPaid,
      "Change Given (IDR)": sale.changeGiven,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report")

    const dateFromStr = dateFrom ? `_from_${dateFrom}` : ""
    const dateToStr = dateTo ? `_to_${dateTo}` : ""
    const fileName = `sales_report${dateFromStr}${dateToStr}.xlsx`

    XLSX.writeFile(wb, fileName)
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{t("title")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("description")}</p>
        </div>
        {!isCashier && (
          <Button onClick={exportToXLSX}>
            <Download className="w-4 h-4 mr-2" />
            Export XLSX
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("totalRevenue")}</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{formatIDR(totalRevenue)}</p>
        </div>
        {!isCashier && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("totalProfit")}</p>
            <p className="text-2xl font-black text-green-700 dark:text-green-400 mt-1">{formatIDR(totalProfit)}</p>
          </div>
        )}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t("totalTransactions")}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">{filteredSales.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search by ID or cashier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-blue-400 pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10 h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 dark:[color-scheme:dark] text-sm font-medium"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center sm:mt-7">
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-blue-400 pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10 h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 dark:[color-scheme:dark] text-sm font-medium"
                  />
                </div>
              </div>
              
              {(dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFrom("")
                    setDateTo("")
                  }}
                  className="self-start sm:self-end h-10"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <React.Fragment key={sale.id}>
                  <TableRow className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50" onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}>
                    <TableCell>
                      {expandedSale === sale.id ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-slate-900 dark:text-slate-50">
                      {new Date(sale.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">{sale.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-50">{sale.user.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sale.items.slice(0, 2).map((item, i) => (
                          <Badge key={i} variant="secondary">
                            {item.product.name} x{item.quantity}
                          </Badge>
                        ))}
                        {sale.items.length > 2 && (
                          <Badge variant="outline">+{sale.items.length - 2} more</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-slate-50">{formatIDR(sale.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.paymentMethod === "CASH" ? "default" : "secondary"}>
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedSale === sale.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-slate-50 dark:bg-slate-900/50 p-0">
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Transaction ID</p>
                              <p className="font-mono text-xs text-slate-900 dark:text-slate-50 truncate">{sale.id}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Date & Time</p>
                              <p className="text-xs text-slate-900 dark:text-slate-50">{new Date(sale.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Cashier</p>
                              <p className="text-xs text-slate-900 dark:text-slate-50">{sale.user.name}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Payment</div>
                              <Badge variant={sale.paymentMethod === "CASH" ? "default" : "secondary"} className="text-xs">
                                {sale.paymentMethod}
                              </Badge>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50">Items Purchased</h4>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                              {sale.items.map((item, i) => (
                                <div key={`${sale.id}-item-${i}`} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.quantity}</span>
                                    </div>
                                    <span className="text-sm text-slate-900 dark:text-slate-50 truncate">{item.product.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatIDR(item.price)}</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-50 min-w-[80px] text-right">{formatIDR(item.price * item.quantity)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                  <span className="font-semibold text-slate-900 dark:text-slate-50">{formatIDR(sale.totalAmount)}</span>
                                </div>
                                {sale.paymentMethod === "CASH" && (
                                  <>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500 dark:text-slate-400">Cash Paid</span>
                                      <span className="text-slate-700 dark:text-slate-300">{formatIDR(sale.cashPaid)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-500 dark:text-slate-400">Change</span>
                                      <span className="text-slate-700 dark:text-slate-300">{formatIDR(sale.changeGiven)}</span>
                                    </div>
                                  </>
                                )}
                                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700">
                                  <span className="font-bold text-slate-900 dark:text-slate-50">Total</span>
                                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatIDR(sale.totalAmount)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sales found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
