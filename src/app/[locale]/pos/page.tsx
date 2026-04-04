"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { formatIDR } from "@/lib/currency"

interface Product {
  id: string
  name: string
  sku: string
  imageUrl: string | null
  sellPrice: number
  stock: number
  minStock: number
  category: string
}

interface Category {
  id: string
  name: string
  color: string
}

interface CartItem extends Product { quantity: number }

export default function POSPage() {
  const t = useTranslations("pos")
  const tCommon = useTranslations("common")
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [cashPaid, setCashPaid] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<{cart: CartItem[], subtotal: number, cashPaid: number, change: number} | null>(null)
  const [printerConfig, setPrinterConfig] = useState({
    storeName: "CloudPOS",
    storeAddress: "Jl. Toko No. 123",
    storePhone: "081234567890",
    logoUrl: "",
    paperWidth: 58
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes, printerRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
          fetch("/api/printers"),
        ])
        setProducts(await productsRes.json())
        setCategories(await categoriesRes.json())
        const printerData = await printerRes.json()
        setPrinterConfig({
          storeName: printerData.storeName,
          storeAddress: printerData.storeAddress,
          storePhone: printerData.storePhone,
          logoUrl: printerData.logoUrl || "",
          paperWidth: printerData.paperWidth
        })
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta
        if (newQty <= 0 || newQty > item.stock) return item
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0)
  const change = Math.max(0, parseFloat(cashPaid || "0") - subtotal)

  const handleCheckout = async () => {
    if (paymentMethod === "CASH" && (!cashPaid || parseFloat(cashPaid) < subtotal)) return
    setProcessing(true)
    
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.sellPrice,
          })),
          paymentMethod,
          cashPaid: parseFloat(cashPaid) || 0,
          changeGiven: change,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process sale")
      }

      const result = await response.json()
      if (result.success) {
        setLastTransaction({
          cart: [...cart],
          subtotal,
          cashPaid: parseFloat(cashPaid) || 0,
          change
        })
        setIsCheckoutOpen(false)
        setIsReceiptOpen(true)
        setCart([])
        setCashPaid("")
        
        const productsRes = await fetch("/api/products")
        setProducts(await productsRes.json())
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to process sale. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handlePrint = () => {
    if (!lastTransaction) return
    
    const now = new Date()
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    
    const itemsHtml = lastTransaction.cart.map(item => `
      <div style="display:flex;justify-content:space-between;margin:4px 0">
        <div>${item.name} x${item.quantity}</div>
        <div>${formatIDR(item.sellPrice * item.quantity)}</div>
      </div>
    `).join("")
    
    const paperWidth = printerConfig.paperWidth === 58 ? "58mm" : "80mm"
    const bodyWidth = printerConfig.paperWidth === 58 ? "180px" : "260px"
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 11px; 
              width: ${paperWidth}; 
              margin: 0 auto;
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
          <div class="f"><span>Kasir:</span><span>Admin</span></div>
          <div class="d"></div>
          ${itemsHtml}
          <div class="d"></div>
          <div class="t"><span>TOTAL</span><span>${formatIDR(lastTransaction.subtotal)}</span></div>
          <div class="f"><span>Tunai</span><span>${formatIDR(lastTransaction.cashPaid)}</span></div>
          <div class="f"><span>Kembalian</span><span>${formatIDR(lastTransaction.change)}</span></div>
          <div class="d"></div>
          <div class="h" style="font-size:10px">
            Terima kasih atas kunjungan<br/>Anda
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] lg:min-h-screen">
      <div className="flex-1 flex flex-col p-4 lg:pr-96 lg:p-6 pb-40 lg:pb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-black font-headline text-slate-900">{t("title")}</h2>
            <p className="text-sm text-slate-500 hidden sm:block">{t("selectItems")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center bg-white rounded-full px-3 lg:px-4 py-2 w-full sm:w-48 lg:w-64 border border-slate-200">
              <svg className="w-4 lg:w-5 h-4 lg:h-5 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full" placeholder={t("searchProducts")} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40 bg-white rounded-full border border-slate-200">
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:g-4">
            {filteredProducts.map(product => (
              <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock === 0} className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 text-left hover:shadow-lg hover:shadow-blue-900/5 transition-all disabled:opacity-50 group">
                <div className="aspect-square bg-slate-100 rounded-lg lg:rounded-xl mb-2 lg:mb-3 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <svg className="w-8 lg:w-12 h-8 lg:h-12 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3z" /></svg>}
                </div>
                <h3 className="font-headline font-semibold text-sm text-slate-900 truncate">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-1 lg:mb-2">{product.sku}</p>
                <div className="flex items-center justify-between">
                  <span className="font-headline font-black text-blue-700 text-base lg:text-lg">{formatIDR(product.sellPrice)}</span>
                  {product.stock <= product.minStock && <span className={`text-[9px] lg:text-[10px] font-bold px-1.5 lg:px-2 py-0.5 rounded ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{product.stock === 0 ? t("outOfStock") : t("lowStock")}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:bottom-auto lg:top-16 lg:left-auto lg:right-0 lg:w-96 lg:min-w-96 lg:h-[calc(100vh-4rem)] bg-slate-100 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 shadow-xl lg:shadow-none z-20">
        <div className="p-4 lg:p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline font-bold text-lg text-slate-900">{t("currentOrder")}</h3>
            {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs font-bold text-red-600 hover:underline">{t("clearAll")}</button>}
          </div>
          <p className="text-xs text-slate-500">{cart.length} {t("items")}</p>
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <svg className="w-12 lg:w-16 h-12 lg:h-16 mx-auto text-slate-300 mb-3 lg:mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
              <p className="text-sm text-slate-500">{t("noItemsInCart")}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-2 lg:gap-3 p-2 lg:p-3 bg-white rounded-lg">
                <div className="w-12 lg:w-14 h-12 lg:h-14 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded" /> : <svg className="w-5 lg:w-6 h-5 lg:h-6 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3z" /></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline font-semibold text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-slate-500">{formatIDR(item.sellPrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 lg:w-7 h-6 lg:h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 text-sm font-bold">-</button>
                  <span className="w-6 lg:w-8 text-center font-headline font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 lg:w-7 h-6 lg:h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 text-sm font-bold">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 lg:p-6 bg-white border-t border-slate-200">
          <div className="space-y-2 mb-3 lg:mb-4">
            <div className="flex justify-between text-sm"><span className="text-slate-500">{t("subtotal")}</span><span className="font-headline font-bold">{formatIDR(subtotal)}</span></div>
            <div className="flex justify-between text-base lg:text-lg"><span className="font-headline font-bold">{t("total")}</span><span className="font-headline font-black text-blue-700 text-lg lg:text-xl">{formatIDR(subtotal)}</span></div>
          </div>
          <button onClick={() => setIsCheckoutOpen(true)} disabled={cart.length === 0} className="w-full signature-gradient text-white py-3 lg:py-4 rounded-xl font-headline font-bold text-base lg:text-lg shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50">
            {t("checkout")} {formatIDR(subtotal)}
          </button>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-sm lg:max-w-md">
          <DialogHeader><DialogTitle className="font-headline font-bold text-xl">{t("completePayment")}</DialogTitle></DialogHeader>
          <div className="space-y-4 lg:space-y-6 py-4">
            <div className="flex justify-between items-center p-3 lg:p-4 bg-slate-50 rounded-xl">
              <span className="font-headline font-bold text-base lg:text-lg">{t("total")}</span>
              <span className="font-headline font-black text-blue-700 text-xl lg:text-2xl">{formatIDR(subtotal)}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">{t("paymentMethod")}</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="CASH">{t("cash")}</SelectItem><SelectItem value="QRIS">{t("qris")}</SelectItem></SelectContent>
              </Select>
            </div>
            {paymentMethod === "CASH" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">{t("cashPaid")}</label>
                <input type="number" value={cashPaid} onChange={e => setCashPaid(e.target.value)} className="w-full p-3 lg:p-4 bg-white rounded-xl border border-slate-200 text-base lg:text-xl font-headline font-bold" placeholder="0.00" autoFocus />
                {cashPaid && parseFloat(cashPaid) >= subtotal && (
                  <div className="flex justify-between p-3 lg:p-4 bg-green-50 rounded-xl">
                    <span className="text-sm font-bold text-green-700">{t("change")}</span>
                    <span className="font-headline font-black text-green-700 text-base lg:text-xl">{formatIDR(change)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 px-4 lg:px-6 py-2 lg:py-3 bg-slate-100 text-slate-700 rounded-xl font-headline font-bold hover:bg-slate-200 text-sm lg:text-base">{tCommon("cancel")}</button>
            <button onClick={handleCheckout} disabled={processing || (paymentMethod === "CASH" && (!cashPaid || parseFloat(cashPaid) < subtotal))} className="flex-1 px-4 lg:px-6 py-2 lg:py-3 signature-gradient text-white rounded-xl font-headline font-bold shadow-lg hover:-translate-y-0.5 active:scale-[0.98] text-sm lg:text-base disabled:opacity-50">
              {processing ? tCommon("loading") : t("processPayment")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-center font-headline font-bold text-xl">{t("paymentSuccess")}</DialogTitle></DialogHeader>
          <div className="py-4 lg:py-6 text-center">
            <div className="w-14 lg:w-16 h-14 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4"><svg className="w-7 lg:w-8 h-7 lg:h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg></div>
            <p className="text-2xl font-black font-headline text-slate-900">{formatIDR(subtotal)}</p>
            <p className="text-sm text-slate-500 mt-1">{t("transactionCompleted")}</p>
          </div>
          <DialogFooter className="flex-col gap-2">
            <button onClick={handlePrint} className="w-full signature-gradient text-white py-2.5 lg:py-3 rounded-xl font-headline font-bold flex items-center justify-center gap-2 text-sm lg:text-base">
              <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" /></svg>
              {t("printReceipt")}
            </button>
            <button onClick={() => setIsReceiptOpen(false)} className="w-full px-4 lg:px-6 py-2 lg:py-3 bg-slate-100 text-slate-700 rounded-xl font-headline font-bold hover:bg-slate-200 text-sm lg:text-base">{t("newSale")}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
