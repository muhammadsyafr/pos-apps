"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import {
  cacheProducts,
  getCachedProducts,
  cacheCategories,
  getCachedCategories,
  queuePendingSale,
  getPendingSales,
  markSaleSynced,
  updateProductStockLocally,
} from "@/lib/offline-db"

export { getPendingSales }

interface Product {
  id: string
  name: string
  sku: string
  imageUrl: string | null
  sellPrice: number
  costPrice: number
  stock: number
  minStock: number
  category: string
}

interface Category {
  id: string
  name: string
  color: string
}

interface PendingSale {
  id?: number
  items: Array<{ id: string; quantity: number; price: number }>
  paymentMethod: string
  cashPaid: number
  changeGiven: number
  subtotal: number
  timestamp: number
  synced: boolean
}

interface OfflineContextType {
  isOnline: boolean
  pendingCount: number
  isSyncing: boolean
  syncNow: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  pendingCount: 0,
  isSyncing: false,
  syncNow: async () => {},
})

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      console.log("Network: Online")
      setIsOnline(true)
    }
    const handleOffline = () => {
      console.log("Network: Offline")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const syncPendingSales = useCallback(async () => {
    if (!navigator.onLine) return

    const pending = await getPendingSales()
    if (pending.length === 0) return

    console.log("Syncing", pending.length, "pending sales...")
    setIsSyncing(true)

    for (const sale of pending) {
      if (sale.id === undefined) continue
      try {
        const response = await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: sale.items,
            paymentMethod: sale.paymentMethod,
            cashPaid: sale.cashPaid,
            changeGiven: sale.changeGiven,
          }),
        })

        if (response.ok) {
          console.log("Synced sale:", sale.id)
          await markSaleSynced(sale.id)
        } else {
          console.log("Failed to sync sale:", sale.id, response.status)
        }
      } catch (error) {
        console.error("Failed to sync sale:", sale.id, error)
      }
    }

    const remaining = await getPendingSales()
    setPendingCount(remaining.length)
    setIsSyncing(false)
  }, [])

  useEffect(() => {
    async function loadPendingCount() {
      const pending = await getPendingSales()
      setPendingCount(pending.length)
    }
    loadPendingCount()

    const handlePendingUpdate = (e: Event) => {
      const count = (e as CustomEvent).detail
      setPendingCount(count)
    }
    window.addEventListener('pending-count-updated', handlePendingUpdate)
    return () => window.removeEventListener('pending-count-updated', handlePendingUpdate)
  }, [])

  useEffect(() => {
    if (isOnline) {
      syncPendingSales()
      const interval = setInterval(syncPendingSales, 30000)
      return () => clearInterval(interval)
    }
  }, [isOnline, syncPendingSales])

  return (
    <OfflineContext.Provider value={{ isOnline, pendingCount, isSyncing, syncNow: syncPendingSales }}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  return useContext(OfflineContext)
}

export async function fetchProductsWithCache(): Promise<{
  products: Product[]
  fromCache: boolean
}> {
  if (navigator.onLine) {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const products: Product[] = await response.json()
        console.log("Caching", products.length, "products")
        await cacheProducts(products)
        return { products, fromCache: false }
      } else {
        console.log("Products API returned", response.status)
      }
    } catch (error) {
      console.log("Online fetch failed, using cache:", error)
    }
  }
  const cached = await getCachedProducts()
  console.log("Using", cached.length, "cached products")
  return { products: cached, fromCache: true }
}

export async function fetchCategoriesWithCache(): Promise<{
  categories: Category[]
  fromCache: boolean
}> {
  if (navigator.onLine) {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const categories: Category[] = await response.json()
        await cacheCategories(categories)
        return { categories, fromCache: false }
      }
    } catch (error) {
      console.log("Online fetch failed, using cache:", error)
    }
  }
  const cached = await getCachedCategories()
  return { categories: cached, fromCache: true }
}

export async function processSaleOffline(
  cart: Array<{ id: string; quantity: number; sellPrice: number }>,
  paymentMethod: string,
  cashPaid: number,
  changeGiven: number,
  subtotal: number
): Promise<{ queued: boolean; error?: string }> {
  if (navigator.onLine) {
    return { queued: false, error: "Online - should use API" }
  }

  for (const item of cart) {
    await updateProductStockLocally(item.id, item.quantity)
  }

  await queuePendingSale({
    items: cart.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.sellPrice,
    })),
    paymentMethod,
    cashPaid,
    changeGiven,
    subtotal,
    timestamp: Date.now(),
  })

  return { queued: true }
}
