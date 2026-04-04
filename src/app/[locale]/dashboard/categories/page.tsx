"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit2, Trash2, Tag, Folder } from "lucide-react"
import { useTranslations } from "next-intl"

interface Category {
  id: string
  name: string
  color: string
  tags: Tag[]
}

interface Tag {
  id: string
  name: string
  categoryId: string | null
}

const colorOptions = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#6B7280", label: "Gray" },
]

export default function CategoriesPage() {
  const t = useTranslations("categories")
  const tCommon = useTranslations("common")
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"categories" | "tags">("categories")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({ id: "", name: "", color: "#3B82F6", categoryId: "" })

  const fetchData = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/tags"),
      ])
      setCategories(await catRes.json())
      setTags(await tagRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    try {
      if (activeTab === "categories") {
        if (isEditMode) {
          await fetch(`/api/categories/${formData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: formData.name, color: formData.color }),
          })
        } else {
          await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: formData.name, color: formData.color }),
          })
        }
      } else {
        if (isEditMode) {
          await fetch(`/api/tags`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: formData.id, name: formData.name, categoryId: formData.categoryId || null }),
          })
        } else {
          await fetch("/api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: formData.name, categoryId: formData.categoryId || null }),
          })
        }
      }
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Failed to save:", error)
    }
  }

  const handleEdit = (item: Category | Tag) => {
    setFormData({
      id: item.id,
      name: item.name,
      color: "color" in item ? item.color : "#3B82F6",
      categoryId: "categoryId" in item ? item.categoryId || "" : "",
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const endpoint = activeTab === "categories" ? `/api/categories/${id}` : `/api/tags?id=${id}`
      await fetch(endpoint, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  const resetForm = () => {
    setFormData({ id: "", name: "", color: "#3B82F6", categoryId: "" })
    setIsEditMode(false)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return <div className="p-8 text-center">{tCommon("loading")}</div>
  }

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-slate-500">{t("description")}</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === "categories" ? t("addCategory") : t("addTag")}
        </Button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Folder className="w-4 h-4 inline mr-2" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "tags"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Tag className="w-4 h-4 inline mr-2" />
          Tags ({tags.length})
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {activeTab === "categories" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <Card key={cat.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <CardTitle className="text-base font-semibold">{cat.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">{cat.tags.length} tags</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cat.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>
                  ))}
                  {cat.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{cat.tags.length - 3}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredCategories.length === 0 && (
            <p className="col-span-full text-center py-8 text-slate-500">No categories found</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTags.map((tag) => {
            const category = categories.find(c => c.id === tag.categoryId)
            return (
              <Card key={tag.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{tag.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {category ? (
                    <Badge style={{ backgroundColor: category.color + "20", color: category.color }}>
                      {category.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Uncategorized</Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {filteredTags.length === 0 && (
            <p className="col-span-full text-center py-8 text-slate-500">No tags found</p>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit" : "Add"} {activeTab === "categories" ? "Category" : "Tag"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            {activeTab === "categories" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        formData.color === c.value ? "scale-110 ring-2 ring-offset-2 ring-slate-400" : ""
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            )}
            {activeTab === "tags" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {isEditMode ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
