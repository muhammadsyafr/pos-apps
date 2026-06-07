"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Plus, Search, Edit2, Trash2, ImagePlus } from "lucide-react"
import { useTranslations } from "next-intl"
import { formatIDR, formatNumberIDR, parseNumber } from "@/lib/currency"

interface Product {
  id: string
  name: string
  sku: string
  imageUrl: string | null
  costPrice: number
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

export default function InventoryPage() {
  const t = useTranslations("inventory")
  const tCommon = useTranslations("common")
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "en"
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    sku: "",
    costPrice: "",
    sellPrice: "",
    stock: "",
    minStock: "5",
    category: "",
    imageUrl: "",
  })

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].name }))
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is CASHIER and redirect to dashboard
    if (status === "authenticated" && session?.user?.role === "CASHIER") {
      router.push(`/${locale}/dashboard`)
    }
  }, [status, session, router, locale])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())) &&
      (categoryFilter === "all" || p.category === categoryFilter)
  )

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Product name is required")
      return
    }
    if (!formData.sku.trim()) {
      alert("SKU is required")
      return
    }
    if (!formData.category) {
      alert("Category is required")
      return
    }
    if (formData.stock === "" || parseInt(formData.stock) < 0) {
      alert("Stock cannot be empty or negative")
      return
    }
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      alert("Cost price is required and must be greater than 0")
      return
    }
    if (!formData.sellPrice || parseFloat(formData.sellPrice) <= 0) {
      alert("Sell price is required and must be greater than 0")
      return
    }

    try {
      if (isEditMode) {
        await fetch(`/api/products/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error("Failed to save product:", error)
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      sku: product.sku,
      costPrice: product.costPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category,
      imageUrl: product.imageUrl || "",
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm") || "Are you sure you want to delete this product?")) return
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" })
      fetchProducts()
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      sku: "",
      costPrice: "",
      sellPrice: "",
      stock: "",
      minStock: "5",
      category: categories.length > 0 ? categories[0].name : "",
      imageUrl: "",
    })
    setIsEditMode(false)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      alert("File too large. Maximum size is 500KB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Allowed: JPEG, PNG, GIF, WebP")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }))
      } else {
        alert(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image")
    }
  }

  if (loading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
          <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-56 rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>
          <div className="p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Cost Price</TableHead>
                  <TableHead className="text-right">Sell Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto rounded-full" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
  }

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink dark:text-on-dark">{t("title")}</h1>
          <p className="text-shade-50 dark:text-shade-40">{t("description")}</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t("addProduct")}
        </Button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 dark:border-yellow-700 rounded-xl p-5">
          <div className="text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
            <Badge variant="warning">{lowStockCount}</Badge>
            <span>{lowStockCount} {t("lowStockMessage")}</span>
          </div>
        </div>
      )}

      <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
        <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
          <div className="flex items-center gap-4">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shade-50 dark:text-shade-40" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 rounded-full">
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>{t("productName")}</TableHead>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("category")}</TableHead>
                <TableHead className="text-right">{t("costPrice")}</TableHead>
                <TableHead className="text-right">{t("sellPrice")}</TableHead>
                <TableHead className="text-right">{t("stock")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-shade-50 dark:text-shade-40">
                    {t("noProducts")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-xl bg-shade-30 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-shade-50 dark:text-shade-40" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-ink dark:text-on-dark">{product.name}</TableCell>
                    <TableCell className="text-shade-50 dark:text-shade-40">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-ink dark:text-on-dark">{formatIDR(product.costPrice)}</TableCell>
                    <TableCell className="text-right text-ink dark:text-on-dark">{formatIDR(product.sellPrice)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={product.stock === 0 ? "destructive" : product.stock <= product.minStock ? "warning" : "default"}
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="hover:bg-red-50 dark:hover:bg-red-950/30">
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? t("editProduct") : t("addProduct")}</DialogTitle>
            </DialogHeader>
          <div className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">{t("productName")}</label>
              <Input
                className="rounded-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("productName")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">{t("sku")}</label>
              <Input
                className="rounded-full"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder={t("sku")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">{t("costPrice")}</label>
                <Input
                  className="rounded-full"
                  type="text"
                  value={formData.costPrice ? formatNumberIDR(Number(formData.costPrice)) : ""}
                  onChange={(e) => {
                    const numValue = e.target.value.replace(/\D/g, "")
                    setFormData({ ...formData, costPrice: numValue })
                  }}
                  placeholder="Rp 0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">{t("sellPrice")}</label>
                <Input
                  className="rounded-full"
                  type="text"
                  value={formData.sellPrice ? formatNumberIDR(Number(formData.sellPrice)) : ""}
                  onChange={(e) => {
                    const numValue = e.target.value.replace(/\D/g, "")
                    setFormData({ ...formData, sellPrice: numValue })
                  }}
                  placeholder="Rp 0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">{t("stock")}</label>
                <Input
                  className="rounded-full"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">{t("minStock")}</label>
                <Input
                  className="rounded-full"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">{t("category")}</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">Product Image</label>
              <div className="border-2 border-dashed border-hairline-light dark:border-hairline-dark rounded-xl p-4">
                {formData.imageUrl ? (
                  <div className="relative">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-contain rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                    <ImagePlus className="w-8 h-8 text-shade-50 dark:text-shade-40 mb-2" />
                    <span className="text-sm text-shade-50 dark:text-shade-40">Click to upload (max 500KB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline-light" onClick={() => setIsDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSubmit}>
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
