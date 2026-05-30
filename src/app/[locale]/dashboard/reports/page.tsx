"use client"

import { useState, useEffect, useCallback } from "react"
import React from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Search, FileText, Download, Calendar, ChevronDown, ChevronRight, Printer } from "lucide-react"
import * as XLSX from "xlsx"
import { useTranslations } from "next-intl"
import { formatIDR } from "@/lib/currency"
import { bluetoothPrinter } from "@/lib/bluetooth-printer"
import { useSession } from "next-auth/react"

interface Sale {
  id: string
  totalAmount: number
  cashPaid: number
  changeGiven: number
  paymentMethod: string
  createdAt: string
  user: { name: string }
  items: { product: { name: string }; quantity: number; price: number; costPrice: number }[]
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const PAGE_SIZE = 10

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
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [printerConfig, setPrinterConfig] = useState({
    storeName: "CloudPOS",
    storeAddress: "Jl. Toko No. 123",
    storePhone: "081234567890",
    logoUrl: "",
    paperWidth: 58,
    footerText: "Terima kasih atas\nkunjungan Anda"
  })

  const pageSize = PAGE_SIZE
  const totalPages = Math.ceil(totalItems / pageSize)

  const fetchSales = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum), pageSize: String(pageSize) })
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      if (search) params.set("search", search)

      const res = await fetch(`/api/sales?${params}`)
      const data = await res.json()
      if (data.sales) {
        setSales(data.sales)
        setTotalItems(data.pagination?.total || 0)
      } else {
        setSales([])
        setTotalItems(0)
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, search])

  useEffect(() => {
    fetchSales(page)
    async function fetchPrinterConfig() {
      try {
        const res = await fetch("/api/printers")
        const data = await res.json()
        setPrinterConfig({
          storeName: data.storeName || "CloudPOS",
          storeAddress: data.storeAddress || "Jl. Toko No. 123",
          storePhone: data.storePhone || "081234567890",
          logoUrl: data.logoUrl || "",
          paperWidth: data.paperWidth || 58,
          footerText: data.footerText || "Terima kasih atas\nkunjungan Anda"
        })
      } catch (error) {
        console.error("Failed to fetch printer config:", error)
      }
    }
    fetchPrinterConfig()
  }, [page, fetchSales])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setPage(1)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setPage(1)
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
  const totalProfit = sales.reduce((sum, sale) => {
    return (
      sum +
      sale.items.reduce((itemSum, item) => {
        const cost = item.costPrice || 0
        return itemSum + (item.price - cost) * item.quantity
      }, 0)
    )
  }, 0)

  const exportToXLSX = () => {
    const exportData = sales.map((sale) => ({
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

  const handlePrintReceipt = async (sale: Sale) => {
    const now = new Date(sale.createdAt)
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })

    // ── Bluetooth direct print ────────────────────────────────────────────────
    if (bluetoothPrinter.isConnected) {
      try {
        const data = await bluetoothPrinter.buildReceipt({
          storeName: printerConfig.storeName,
          storeAddress: printerConfig.storeAddress,
          storePhone: printerConfig.storePhone,
          logoUrl: printerConfig.logoUrl,
          dateStr,
          timeStr,
          cashierName: sale.user.name,
          saleId: sale.id,
          items: sale.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: sale.totalAmount,
          paymentMethod: sale.paymentMethod,
          cashPaid: sale.cashPaid ?? undefined,
          change: sale.changeGiven ?? undefined,
          paperWidth: printerConfig.paperWidth,
          footerText: printerConfig.footerText,
        })
        await bluetoothPrinter.print(data)
        return
      } catch (err) {
        console.error("Bluetooth print failed, falling back:", err)
      }
    }

    // ── RawBT (Android Classic Bluetooth) ─────────────────────────────────
    if (bluetoothPrinter.isAndroid()) {
      const data = await bluetoothPrinter.buildReceipt({
        storeName: printerConfig.storeName,
        storeAddress: printerConfig.storeAddress,
        storePhone: printerConfig.storePhone,
        logoUrl: printerConfig.logoUrl,
        dateStr,
        timeStr,
        cashierName: sale.user.name,
        saleId: sale.id,
        items: sale.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        cashPaid: sale.cashPaid ?? undefined,
        change: sale.changeGiven ?? undefined,
        paperWidth: printerConfig.paperWidth,
        footerText: printerConfig.footerText,
      })
      bluetoothPrinter.printViaRawBT(data)
      return
    }

    // ── iOS Share Sheet (plain-text receipt .txt) ─────────────────────────
    if (bluetoothPrinter.isIOS()) {
      const receiptText = bluetoothPrinter.buildPlainTextReceipt({
        storeName: printerConfig.storeName,
        storeAddress: printerConfig.storeAddress,
        storePhone: printerConfig.storePhone,
        dateStr,
        timeStr,
        cashierName: sale.user.name,
        saleId: sale.id,
        items: sale.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        cashPaid: sale.cashPaid ?? undefined,
        change: sale.changeGiven ?? undefined,
        paperWidth: printerConfig.paperWidth,
        footerText: printerConfig.footerText,
      })
      bluetoothPrinter.printViaIOSShareSheet(receiptText)
      return
    }

    // ── Browser print fallback ────────────────────────────────────────────────
    const itemsHtml = sale.items.map(item => `
      <div style="display:flex;justify-content:space-between;margin:4px 0">
        <div>${item.product.name} x${item.quantity}</div>
        <div>${formatIDR(item.price * item.quantity)}</div>
      </div>
    `).join("")

    const paperWidth = printerConfig.paperWidth === 58 ? "58mm" : "80mm"
    const footerLines = (printerConfig.footerText || "Terima kasih atas\nkunjungan Anda")
      .split("\n").map((l: string) => l.trim()).filter(Boolean).join("<br/>")

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt - ${sale.id}</title>
          <style>
            @page { size: ${paperWidth} auto; margin: 0; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              width: ${paperWidth};
              margin: 0;
              padding: 5px;
            }
            .h { text-align: center; }
            .d { border-bottom: 1px dashed #000; margin: 6px 0; }
            .t { font-weight: bold; display: flex; justify-content: space-between; }
            .f { display: flex; justify-content: space-between; font-size: 10px; }
            .title { font-size: 14px; font-weight: bold; }
            .logo { max-width: 60px; max-height: 40px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="h">
            ${printerConfig.logoUrl ? `<img src="${printerConfig.logoUrl}" class="logo" />` : ""}
            <div class="title">${printerConfig.storeName || "CloudPOS"}</div>
            <div style="font-size:10px">${printerConfig.storeAddress || "Jl. Toko No. 123"}</div>
            <div style="font-size:10px">Telp: ${printerConfig.storePhone || "081234567890"}</div>
          </div>
          <div class="d"></div>
          <div class="f"><span>${dateStr}</span><span>${timeStr}</span></div>
          <div class="f"><span>Kasir:</span><span>${sale.user.name}</span></div>
          <div class="f"><span>ID:</span><span>${sale.id.slice(0, 8)}</span></div>
          <div class="d"></div>
          ${itemsHtml}
          <div class="d"></div>
          <div class="t"><span>TOTAL</span><span>${formatIDR(sale.totalAmount)}</span></div>
          ${sale.paymentMethod === "CASH" ? `
          <div class="f"><span>Tunai</span><span>${formatIDR(sale.cashPaid)}</span></div>
          <div class="f"><span>Kembalian</span><span>${formatIDR(sale.changeGiven)}</span></div>
          ` : `
          <div class="f"><span>Metode</span><span>${sale.paymentMethod}</span></div>
          `}
          <div class="d"></div>
          <div class="h" style="font-size:10px">${footerLines}</div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(receiptHtml)
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) {
    return <div className="p-8 text-center text-shade-50 dark:text-shade-40">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink dark:text-on-dark">{t("title")}</h1>
          <p className="text-shade-50 dark:text-shade-40">{t("description")}</p>
        </div>
        {!isCashier && (
          <Button onClick={exportToXLSX}>
            <Download className="w-4 h-4 mr-2" />
            Export XLSX
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-canvas-light dark:bg-canvas-night-elevated p-5 rounded-xl elevation-3 dark:elevation-1">
          <p className="text-xs font-bold text-shade-50 dark:text-shade-40 uppercase tracking-wide">{t("totalRevenue")}</p>
          <p className="text-2xl font-black text-ink dark:text-on-dark mt-1">{formatIDR(totalRevenue)}</p>
        </div>
        {!isCashier && (
          <div className="bg-canvas-light dark:bg-canvas-night-elevated p-5 rounded-xl elevation-3 dark:elevation-1">
            <p className="text-xs font-bold text-shade-50 dark:text-shade-40 uppercase tracking-wide">{t("totalProfit")}</p>
            <p className="text-2xl font-black text-green-700 dark:text-green-400 mt-1">{formatIDR(totalProfit)}</p>
          </div>
        )}
        <div className="bg-canvas-light dark:bg-canvas-night-elevated p-5 rounded-xl elevation-3 dark:elevation-1">
          <p className="text-xs font-bold text-shade-50 dark:text-shade-40 uppercase tracking-wide">{t("totalTransactions")}</p>
          <p className="text-2xl font-black text-ink dark:text-on-dark mt-1">{totalItems}</p>
        </div>
      </div>

      <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
        <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shade-50 dark:text-shade-40" />
              <Input
                placeholder="Search by ID or cashier..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-shade-50 dark:text-shade-40 uppercase tracking-wide mb-1.5 block">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-on-dark pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="pl-10 h-10 bg-canvas-cream dark:bg-canvas-night/50 border-hairline-light dark:border-hairline-dark dark:[color-scheme:dark] text-sm font-medium"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center sm:mt-7">
                <svg className="w-4 h-4 text-shade-50 dark:text-shade-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              
              <div className="flex-1">
                <label className="text-xs font-semibold text-shade-50 dark:text-shade-40 uppercase tracking-wide mb-1.5 block">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-on-dark pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="pl-10 h-10 bg-canvas-cream dark:bg-canvas-night/50 border-hairline-light dark:border-hairline-dark dark:[color-scheme:dark] text-sm font-medium"
                  />
                </div>
              </div>
              
              {(dateFrom || dateTo) && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => {
                    setDateFrom("")
                    setDateTo("")
                    setPage(1)
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
              {sales.map((sale) => (
                <React.Fragment key={sale.id}>
                  <TableRow className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}>
                    <TableCell>
                      {expandedSale === sale.id ? (
                        <ChevronDown className="w-4 h-4 text-shade-50 dark:text-shade-40" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-shade-50 dark:text-shade-40" />
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-ink dark:text-on-dark">
                      {new Date(sale.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-shade-50 dark:text-shade-40">{sale.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-ink dark:text-on-dark">{sale.user.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sale.items.slice(0, 2).map((item, i) => (
                          <Badge key={i} variant="secondary" className="max-w-[120px] overflow-hidden">
                            <span className="truncate">{item.product.name} x{item.quantity}</span>
                          </Badge>
                        ))}
                        {sale.items.length > 2 && (
                          <Badge variant="outline">+{sale.items.length - 2} more</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-ink dark:text-on-dark">{formatIDR(sale.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.paymentMethod === "CASH" ? "default" : "secondary"}>
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedSale === sale.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-canvas-cream dark:bg-canvas-night/50 p-0">
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl p-3 border border-hairline-light dark:border-hairline-dark">
                              <p className="text-xs font-semibold text-shade-50 dark:text-shade-40 mb-1">Transaction ID</p>
                              <p className="font-mono text-xs text-ink dark:text-on-dark truncate">{sale.id}</p>
                            </div>
                            <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl p-3 border border-hairline-light dark:border-hairline-dark">
                              <p className="text-xs font-semibold text-shade-50 dark:text-shade-40 mb-1">Date & Time</p>
                              <p className="text-xs text-ink dark:text-on-dark">{new Date(sale.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl p-3 border border-hairline-light dark:border-hairline-dark">
                              <p className="text-xs font-semibold text-shade-50 dark:text-shade-40 mb-1">Cashier</p>
                              <p className="text-xs text-ink dark:text-on-dark">{sale.user.name}</p>
                            </div>
                            <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl p-3 border border-hairline-light dark:border-hairline-dark">
                              <div className="text-xs font-semibold text-shade-50 dark:text-shade-40 mb-1">Payment</div>
                              <Badge variant={sale.paymentMethod === "CASH" ? "default" : "secondary"} className="text-xs">
                                {sale.paymentMethod}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => handlePrintReceipt(sale)} className="gap-1.5">
                              <Printer className="w-3.5 h-3.5" />
                              Print Receipt
                            </Button>
                          </div>

                          <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl border border-hairline-light dark:border-hairline-dark overflow-hidden">
                            <div className="px-3 py-2 bg-canvas-cream dark:bg-canvas-night/50 border-b border-hairline-light dark:border-hairline-dark">
                              <h4 className="text-xs font-bold text-ink dark:text-on-dark">Items Purchased</h4>
                            </div>
                            <div className="divide-y divide-hairline-light dark:divide-hairline-dark">
                              {sale.items.map((item, i) => {
                                const itemProfit = (item.price - (item.costPrice || 0)) * item.quantity
                                return (
                                <div key={`${sale.id}-item-${i}`} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded bg-aloe-10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs font-bold text-ink dark:text-on-dark">{item.quantity}</span>
                                    </div>
                                    <span className="text-sm text-ink dark:text-on-dark truncate">{item.product.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-xs text-shade-50 dark:text-shade-40">{formatIDR(item.price)}</span>
                                    {!isCashier && (
                                      <span className="text-xs text-green-600 dark:text-green-400 min-w-[60px] text-right">+{formatIDR(itemProfit)}</span>
                                    )}
                                    <span className="text-sm font-semibold text-ink dark:text-on-dark min-w-[80px] text-right">{formatIDR(item.price * item.quantity)}</span>
                                  </div>
                                </div>
                                )
                              })}
                            </div>
                            <div className="px-3 py-2 bg-canvas-cream dark:bg-canvas-night/50 border-t border-hairline-light dark:border-hairline-dark">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                  <span className="text-shade-50 dark:text-shade-40">Subtotal</span>
                                  <span className="font-semibold text-ink dark:text-on-dark">{formatIDR(sale.totalAmount)}</span>
                                </div>
                                {sale.paymentMethod === "CASH" && (
                                  <>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-shade-50 dark:text-shade-40">Cash Paid</span>
                                      <span className="text-ink dark:text-shade-40">{formatIDR(sale.cashPaid)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-shade-50 dark:text-shade-40">Change</span>
                                      <span className="text-ink dark:text-shade-40">{formatIDR(sale.changeGiven)}</span>
                                    </div>
                                  </>
                                )}
                                <div className="flex justify-between pt-1.5 border-t border-hairline-light dark:border-hairline-dark">
                                  <span className="font-bold text-ink dark:text-on-dark">Total</span>
                                  <span className="font-bold text-lg text-ink dark:text-on-dark">{formatIDR(sale.totalAmount)}</span>
                                </div>
                                {!isCashier && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-shade-50 dark:text-shade-40">Profit</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">{formatIDR(sale.items.reduce((sum, item) => sum + (item.price - (item.costPrice || 0)) * item.quantity, 0))}</span>
                                  </div>
                                )}
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
          {sales.length === 0 && !loading && (
            <div className="text-center py-8 text-shade-50 dark:text-shade-40">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sales found</p>
            </div>
          )}
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
