"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
      setProducts(data)
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

  if (loading || categoriesLoading) {
    return <div className="p-8 text-center">{tCommon("loading")}</div>
  }

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-slate-500">{t("description")}</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t("addProduct")}
        </Button>
      </div>

      {lowStockCount > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              <Badge variant="warning" className="mr-2">{lowStockCount}</Badge>
              {lowStockCount} {t("lowStockMessage")}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
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
        </CardHeader>
        <CardContent>
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
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    {t("noProducts")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-slate-500">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatIDR(product.costPrice)}</TableCell>
                    <TableCell className="text-right">{formatIDR(product.sellPrice)}</TableCell>
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
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? t("editProduct") : t("addProduct")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("productName")}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("productName")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("sku")}</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder={t("sku")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("costPrice")}</label>
                <Input
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
                <label className="block text-sm font-medium mb-1">{t("sellPrice")}</label>
                <Input
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
                <label className="block text-sm font-medium mb-1">{t("stock")}</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("minStock")}</label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("category")}</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
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
              <label className="block text-sm font-medium mb-1">{t("imageUrl")}</label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
