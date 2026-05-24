"use client"

import { useState, useEffect } from "react"
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
    return <div className="p-8 text-center text-shade-50 dark:text-shade-40">{tCommon("loading")}</div>
  }

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink dark:text-on-dark">{t("title")}</h1>
          <p className="text-shade-50 dark:text-shade-40">{t("description")}</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === "categories" ? t("addCategory") : t("addTag")}
        </Button>
      </div>

      <div className="flex gap-2 border-b border-hairline-light dark:border-hairline-dark">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "categories"
              ? "border-ink text-ink dark:border-on-dark dark:text-on-dark"
              : "border-transparent text-shade-50 dark:text-shade-40 hover:text-ink dark:hover:text-shade-40"
            }`}
        >
          <Folder className="w-4 h-4 inline mr-2" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "tags"
              ? "border-ink text-ink dark:border-on-dark dark:text-on-dark"
              : "border-transparent text-shade-50 dark:text-shade-40 hover:text-ink dark:hover:text-shade-40"
            }`}
        >
          <Tag className="w-4 h-4 inline mr-2" />
          Tags ({tags.length})
        </button>
      </div>

      <div className="relative w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shade-50 dark:text-shade-40" />
        <Input
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-full"
        />
      </div>

      {activeTab === "categories" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1 hover:shadow-lg transition-shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-base font-semibold text-ink dark:text-on-dark">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="hover:bg-red-50 dark:hover:bg-red-950/30">
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-shade-50 dark:text-shade-40">{cat.tags.length} tags</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {cat.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>
                ))}
                {cat.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{cat.tags.length - 3}</Badge>
                )}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <p className="col-span-full text-center py-8 text-shade-50 dark:text-shade-40">No categories found</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTags.map((tag) => {
            const category = categories.find(c => c.id === tag.categoryId)
            return (
              <div key={tag.id} className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1 hover:shadow-lg transition-shadow p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-shade-50 dark:text-shade-40" />
                    <span className="font-semibold text-ink dark:text-on-dark">{tag.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)} className="hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>
                {category ? (
                  <Badge style={{ backgroundColor: category.color + "20", color: category.color }}>
                    {category.name}
                  </Badge>
                ) : (
                  <Badge variant="outline">Uncategorized</Badge>
                )}
              </div>
            )
          })}
          {filteredTags.length === 0 && (
            <p className="col-span-full text-center py-8 text-shade-50 dark:text-shade-40">No tags found</p>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit" : "Add"} {activeTab === "categories" ? "Category" : "Tag"}</DialogTitle>
          </DialogHeader>
          <div className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">Name</label>
              <Input
                className="rounded-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            {activeTab === "categories" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === c.value ? "scale-110 ring-2 ring-offset-2 dark:ring-offset-canvas-night ring-shade-50" : ""
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            )}
            {activeTab === "tags" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-ink dark:text-on-dark">Category</label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="rounded-full">
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
            <Button variant="outline-light" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
              {tCommon("cancel")}
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
