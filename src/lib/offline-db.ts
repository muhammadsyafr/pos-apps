import { openDB, DBSchema, IDBPDatabase } from "idb"

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
  synced: boolean | number
}

interface OfflineDB extends DBSchema {
  products: {
    key: string
    value: Product
    indexes: { "by-category": string }
  }
  categories: {
    key: string
    value: Category
  }
  pendingSales: {
    key: number
    value: PendingSale
  }
}

let dbInstance: IDBPDatabase<OfflineDB> | null = null

export async function getOfflineDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<OfflineDB>("cloudpos-offline", 1, {
    upgrade(db) {
      const productStore = db.createObjectStore("products", { keyPath: "id" })
      productStore.createIndex("by-category", "category")

      db.createObjectStore("categories", { keyPath: "id" })

      db.createObjectStore("pendingSales", {
        keyPath: "id",
        autoIncrement: true,
      })
    },
  })

  return dbInstance
}

export async function cacheProducts(products: Product[]): Promise<void> {
  const db = await getOfflineDB()
  const tx = db.transaction("products", "readwrite")
  await tx.objectStore("products").clear()
  for (const product of products) {
    await tx.objectStore("products").put(product)
  }
  await tx.done
}

export async function getCachedProducts(): Promise<Product[]> {
  const db = await getOfflineDB()
  return db.getAll("products")
}

export async function cacheCategories(categories: Category[]): Promise<void> {
  const db = await getOfflineDB()
  const tx = db.transaction("categories", "readwrite")
  await tx.objectStore("categories").clear()
  for (const category of categories) {
    await tx.objectStore("categories").put(category)
  }
  await tx.done
}

export async function getCachedCategories(): Promise<Category[]> {
  const db = await getOfflineDB()
  return db.getAll("categories")
}

export async function queuePendingSale(sale: Omit<PendingSale, "id" | "synced">): Promise<number> {
  const db = await getOfflineDB()
  const record = { ...sale, synced: 0 }
  return db.add("pendingSales", record)
}

export async function getPendingSales(): Promise<PendingSale[]> {
  const db = await getOfflineDB()
  const all = await db.getAll("pendingSales")
  return all.filter(sale => sale.synced === 0 || sale.synced === false)
}

export async function markSaleSynced(id: number): Promise<void> {
  const db = await getOfflineDB()
  const sale = await db.get("pendingSales", id)
  if (sale) {
    sale.synced = true
    await db.put("pendingSales", sale)
  }
}

export async function deletePendingSale(id: number): Promise<void> {
  const db = await getOfflineDB()
  await db.delete("pendingSales", id)
}

export async function updateProductStockLocally(
  productId: string,
  quantityDecrement: number
): Promise<void> {
  const db = await getOfflineDB()
  const product = await db.get("products", productId)
  if (product) {
    product.stock = Math.max(0, product.stock - quantityDecrement)
    await db.put("products", product)
  }
}
