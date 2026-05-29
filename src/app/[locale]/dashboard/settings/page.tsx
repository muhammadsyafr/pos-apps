"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatIDR } from "@/lib/currency"
import { Printer, Bluetooth, Upload, Save, PrinterIcon, Globe, Settings as SettingsIcon, Users, Edit3, Trash2, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface PrinterSettings {
  id: string
  storeName: string
  storeAddress: string
  storePhone: string
  logoUrl: string | null
  paperWidth: number
  printerName: string | null
  printerAddress: string | null
  footerText: string
}

interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
}

export default function SettingsPage() {
  const t = useTranslations("settings")
  const tPrinter = useTranslations("printer")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isCashier = session?.user?.role === "CASHIER"
  const isLoading = status === "loading"
  
  const [config, setConfig] = useState<PrinterSettings>({
    id: "default",
    storeName: "CloudPOS",
    storeAddress: "Jl. Toko No. 123",
    storePhone: "081234567890",
    logoUrl: null,
    paperWidth: 58,
    printerName: null,
    printerAddress: null,
    footerText: "Terima kasih atas\nkunjungan Anda"
  })
  
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scannedDevices, setScannedDevices] = useState<BluetoothDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  
  const [previewItems] = useState<ReceiptItem[]>([
    { name: "Coffee Latte", quantity: 2, price: 25000 },
    { name: "Sandwich Chicken", quantity: 1, price: 20000 },
    { name: "French Fries", quantity: 1, price: 15000 },
  ])
  
  const previewSubtotal = previewItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const previewCash = 100000
  const previewChange = previewCash - previewSubtotal

  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState<UserFormData>({ name: "", email: "", password: "", role: "CASHIER" })
  const [userSaving, setUserSaving] = useState(false)
  const [userError, setUserError] = useState("")

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "id", label: "Indonesia", flag: "🇮🇩" },
  ]

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/printers")
        const data = await res.json()
        setConfig({
          ...data,
          footerText: data.footerText ?? "Terima kasih atas\nkunjungan Anda"
        })
      } catch (error) {
        console.error("Failed to fetch printer settings:", error)
      }
    }
    fetchConfig()
  }, [])

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (!isCashier) {
      fetchUsers()
    }
  }, [isCashier])

  useEffect(() => {
    if (!navigator.bluetooth) {
      setIsBluetoothSupported(false)
    }
  }, [])

  const handleLanguageChange = (nextLocale: string) => {
    if (locale === nextLocale) return

    const localeSet = new Set(["en", "id"])
    const segments = pathname.split("/").filter(Boolean)
    const rest = [...segments]

    if (rest[0] && localeSet.has(rest[0])) rest.shift()
    if (rest[0] && localeSet.has(rest[0])) rest.shift()

    const newPath = `/${[nextLocale, ...rest].join("/")}`

    window.location.assign(newPath)
  }

  const handleScanBluetooth = async () => {
    setScanning(true)
    setScannedDevices([])
    
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth is not available. Please enable it in chrome://flags or use a supported browser.")
      }
      
      const device = await navigator.bluetooth.requestDevice({
        optionalServices: ["00001800-0000-1000-8000-00805f9b34fb"],
        filters: [
          { namePrefix: "printer" },
          { namePrefix: "thermal" },
          { namePrefix: "POS" },
          { namePrefix: "XP" },
        ]
      })
      
      setScannedDevices([device])
      setSelectedDevice(device)
      setConfig(prev => ({
        ...prev,
        printerName: device.name || "Unknown Printer",
        printerAddress: device.id
      }))
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string }
      let errorMessage = err.message || "Failed to scan for printers"
      
      if (err.name === "NotFoundError") {
        errorMessage = "No printer found. Make sure your printer is turned on and in pairing mode."
      } else if (err.name === "SecurityError") {
        errorMessage = "Bluetooth permission denied. Please allow Bluetooth access when prompted."
      } else if (errorMessage.includes("Web Bluetooth")) {
        errorMessage = "Web Bluetooth API is disabled. Please enable it in chrome://flags '#enable-experimental-web-platform-features' or use Chrome/Edge browser."
      }
      
      alert(errorMessage)
      setIsBluetoothSupported(false)
    } finally {
      setScanning(false)
    }
  }

  const handleSave = async () => {
    setSaveStatus("saving")
    try {
      const res = await fetch("/api/printers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: config.storeName,
          storeAddress: config.storeAddress,
          storePhone: config.storePhone,
          logoUrl: config.logoUrl,
          paperWidth: config.paperWidth,
          printerName: config.printerName,
          printerAddress: config.printerAddress,
          footerText: config.footerText
        })
      })
      if (res.ok) {
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("idle")
      }
    } catch (error) {
      console.error("Failed to save:", error)
      setSaveStatus("idle")
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setConfig(prev => ({ ...prev, logoUrl: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const openUserDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setUserForm({ name: user.name, email: user.email, password: "", role: user.role })
    } else {
      setEditingUser(null)
      setUserForm({ name: "", email: "", password: "", role: "CASHIER" })
    }
    setUserError("")
    setUserDialogOpen(true)
  }

  const closeUserDialog = () => {
    setUserDialogOpen(false)
    setEditingUser(null)
    setUserForm({ name: "", email: "", password: "", role: "CASHIER" })
    setUserError("")
  }

  const handleSaveUser = async () => {
    setUserSaving(true)
    setUserError("")
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"
      const body: { name: string; email: string; role: string; password?: string } = { name: userForm.name, email: userForm.email, role: userForm.role }
      if (userForm.password) body.password = userForm.password

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        closeUserDialog()
        fetchUsers()
      } else {
        const data = await res.json()
        setUserError(data.error || "Failed to save user")
      }
    } catch (error) {
      setUserError("Failed to save user")
    } finally {
      setUserSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" })
      if (res.ok) {
        fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete user")
      }
    } catch (error) {
      alert("Failed to delete user")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink dark:text-on-dark flex items-center gap-2">
            <SettingsIcon className="w-7 h-7" />
            {t("title")}
          </h1>
          <p className="text-shade-50 dark:text-shade-40">{t("description")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-shade-50 dark:text-shade-40">{tCommon("loading")}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Language Settings */}
          <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
            <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
              <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t("language")}
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    locale === lang.code
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-white/10'
                      : 'border-hairline-light dark:border-hairline-dark hover:bg-shade-30 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`font-medium ${locale === lang.code ? 'text-ink dark:text-on-dark' : 'text-ink dark:text-shade-40'}`}>
                    {lang.label}
                  </span>
                  {locale === lang.code && (
                    <span className="ml-auto text-ink dark:text-on-dark text-sm font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bluetooth Printer - Hidden for Cashier */}
          {!isCashier && (
            <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
              <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
                <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                  <Bluetooth className="w-5 h-5" />
                  {tPrinter("bluetoothPrinter")}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {!isBluetoothSupported ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-800 dark:text-yellow-400 text-sm">
                    {tPrinter("bluetoothNotSupported")}
                  </div>
                ) : (
                  <>
                    <Button 
                      onClick={handleScanBluetooth} 
                      disabled={scanning}
                      className="w-full"
                    >
                      {scanning ? tPrinter("scanning") : tPrinter("scanPrinter")}
                    </Button>
                    
                    {scannedDevices.length > 0 && (
                      <div className="space-y-2">
                        <Label>{tPrinter("availablePrinters")}</Label>
                        {scannedDevices.map((device, index) => (
                          <div 
                            key={index}
                            onClick={() => {
                              setSelectedDevice(device)
                              setConfig(prev => ({
                                ...prev,
                                printerName: device.name || "Unknown",
                                printerAddress: device.id
                              }))
                            }}
                            className={`p-3 border rounded-xl cursor-pointer transition-colors ${
                              selectedDevice?.id === device.id 
                                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-white/10" 
                                : "border-hairline-light dark:border-hairline-dark hover:bg-shade-30 dark:hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Printer className="w-4 h-4" />
                              <span className="font-medium text-ink dark:text-on-dark">{device.name || "Unknown Device"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {config.printerName && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <p className="text-sm text-green-800 dark:text-green-400">
                          <strong>{tPrinter("connectedTo")}:</strong> {config.printerName}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Receipt Logo - Hidden for Cashier */}
          {!isCashier && (
            <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
              <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
                <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {tPrinter("receiptLogo")}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-hairline-light dark:border-hairline-dark dark:border-hairline-dark rounded-xl flex items-center justify-center overflow-hidden bg-canvas-cream dark:bg-canvas-night">
                    {config.logoUrl ? (
                      <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-8 h-8 text-shade-50 dark:text-shade-40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label>{tPrinter("uploadLogo")}</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mt-1"
                    />
                  </div>
                </div>
                {config.logoUrl && (
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => setConfig(prev => ({ ...prev, logoUrl: "" }))}
                  >
                    {tPrinter("removeLogo")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Store Info - Hidden for Cashier */}
          {!isCashier && (
            <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
              <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
                <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  {tPrinter("storeInfo")}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <Label>{tPrinter("storeName")}</Label>
                  <Input 
                    value={config.storeName}
                    onChange={(e) => setConfig(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder="Toko Anda"
                  />
                </div>
                <div>
                  <Label>{tPrinter("storeAddress")}</Label>
                  <Input 
                    value={config.storeAddress}
                    onChange={(e) => setConfig(prev => ({ ...prev, storeAddress: e.target.value }))}
                    placeholder="Jl. Alamat No. 123"
                  />
                </div>
                <div>
                  <Label>{tPrinter("storePhone")}</Label>
                  <Input 
                    value={config.storePhone}
                    onChange={(e) => setConfig(prev => ({ ...prev, storePhone: e.target.value }))}
                    placeholder="081234567890"
                  />
                </div>
                <div>
                  <Label>{tPrinter("paperWidth")}</Label>
                  <select 
                    value={config.paperWidth}
                    onChange={(e) => setConfig(prev => ({ ...prev, paperWidth: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-night-elevated text-ink dark:text-on-dark rounded-xl"
                  >
                    <option value={58}>58mm</option>
                    <option value={80}>80mm</option>
                  </select>
                </div>
                
                <div>
                  <Label>{tPrinter("footerText")}</Label>
                  <textarea
                    value={config.footerText}
                    onChange={(e) => setConfig(prev => ({ ...prev, footerText: e.target.value }))}
                    placeholder="Terima kasih atas&#10;kunjungan Anda"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-night shadow-sm text-ink dark:text-on-dark placeholder:text-shade-50 rounded-lg text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:border-ink"
                  />
                  <p className="text-xs text-shade-50 dark:text-shade-40 mt-1">Each line will be centered on the receipt.</p>
                </div>

                <Button onClick={handleSave} className="w-full" disabled={saveStatus === "saving"}>
                  {saveStatus === "saving" ? tCommon("loading") : saveStatus === "saved" ? tPrinter("saved") : tPrinter("saveConfig")}
                </Button>
              </div>
            </div>
          )}

          {/* User Management - Admin Only */}
          {!isCashier && (
            <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
              <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark flex items-center justify-between">
                <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </h2>
                <Button size="sm" onClick={() => openUserDialog()} className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              </div>
              <div className="p-5">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-ink" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-shade-50 dark:text-shade-40 py-4">No users found</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-canvas-cream dark:bg-canvas-night/50 rounded-xl">
                        <div>
                          <p className="font-medium text-ink dark:text-on-dark">{user.name}</p>
                          <p className="text-sm text-shade-50 dark:text-shade-40">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => openUserDialog(user)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Receipt Preview - Always visible */}
        <div>
          <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1 sticky top-6">
            <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
              <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                <PrinterIcon className="w-5 h-5" />
                {tPrinter("receiptPreview")}
              </h2>
            </div>
            <div className="p-5">
              <div 
                className="bg-white dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-300 shadow-sm rounded-md p-4 mx-auto"
                style={{ 
                  width: config.paperWidth === 58 ? "280px" : "380px",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "11px",
                  color: "#000"
                }}
              >
                <div className="text-center border-b border-dashed border-neutral-300 pb-2 mb-2">
                  {config.logoUrl && (
                    <img src={config.logoUrl} alt="Logo" className="w-12 h-12 mx-auto mb-2 object-contain" />
                  )}
                  <div className="font-bold">{config.storeName || "CloudPOS"}</div>
                  <div className="text-xs">{config.storeAddress || "Jl. Toko No. 123"}</div>
                  <div className="text-xs">Telp: {config.storePhone || "081234567890"}</div>
                </div>
                
                <div className="text-xs mb-2">
                  20 May 2026 22:13 | Kasir: Admin
                </div>
                
                <div className="mb-2 border border-neutral-300 rounded-sm overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto] gap-2 px-2 py-1 text-[10px] font-bold border-b border-neutral-300 bg-neutral-50">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  {previewItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto] gap-2 px-2 py-1 text-xs border-b border-neutral-200 last:border-b-0">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatIDR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL</span>
                  <span>{formatIDR(previewSubtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Tunai</span>
                  <span>{formatIDR(previewCash)}</span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span>Kembalian</span>
                  <span>{formatIDR(previewChange)}</span>
                </div>
                
                <div className="text-center border-t border-dashed border-neutral-300 pt-2 mt-2">
                  {(config.footerText || "Terima kasih atas\nkunjungan Anda").split("\n").map((line, i) => (
                    <div key={i} className="text-xs">{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user's information below." : "Enter the new user's details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-6 space-y-4">
            {userError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-xl">
                {userError}
              </div>
            )}
            <div>
              <Label>Name</Label>
              <Input
                className="rounded-full"
                value={userForm.name}
                onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="rounded-full"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Password {editingUser && "(leave blank to keep current)"}</Label>
              <Input
                className="rounded-full"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder={editingUser ? "••••••••" : "Enter password"}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={userForm.role} onValueChange={(v) => setUserForm(prev => ({ ...prev, role: v }))}>
                <SelectTrigger className="rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline-light" onClick={closeUserDialog}>Cancel</Button>
            <Button onClick={handleSaveUser} disabled={userSaving}>
              {userSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
