"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileText, Download, Calendar } from "lucide-react"
import * as XLSX from "xlsx"
import { useTranslations } from "next-intl"
import { formatIDR } from "@/lib/currency"

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
  const [sales, setSales] = useState<Sale[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

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
    return <div className="p-8 text-center">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Reports</h1>
          <p className="text-slate-500">View and analyze your sales history</p>
        </div>
        <Button onClick={exportToXLSX} className="signature-gradient">
          <Download className="w-4 h-4 mr-2" />
          Export XLSX
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{t("totalProfit")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(totalProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by ID or cashier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <span className="text-slate-400">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom("")
                    setDateTo("")
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow key={sale.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(sale.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{sale.id.slice(0, 8)}</TableCell>
                  <TableCell>{sale.user.name}</TableCell>
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
                  <TableCell className="font-bold">{formatIDR(sale.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.paymentMethod === "CASH" ? "default" : "secondary"}>
                      {sale.paymentMethod}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sales found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
