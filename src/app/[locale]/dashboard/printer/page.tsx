"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatIDR } from "@/lib/currency"
import { Printer, Bluetooth, Upload, Save, PrinterIcon } from "lucide-react"

interface PrinterSettings {
  id: string
  storeName: string
  storeAddress: string
  storePhone: string
  logoUrl: string | null
  paperWidth: number
  printerName: string | null
  printerAddress: string | null
}

interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

export default function PrinterSettingsPage() {
  const t = useTranslations("printer")
  const tCommon = useTranslations("common")
  
  const [config, setConfig] = useState<PrinterSettings>({
    id: "default",
    storeName: "CloudPOS",
    storeAddress: "Jl. Toko No. 123",
    storePhone: "081234567890",
    logoUrl: null,
    paperWidth: 58,
    printerName: null,
    printerAddress: null
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

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/printers")
        const data = await res.json()
        setConfig(data)
      } catch (error) {
        console.error("Failed to fetch printer settings:", error)
      }
    }
    fetchConfig()
    
    if (typeof window !== "undefined" && !navigator.bluetooth) {
      setIsBluetoothSupported(false)
    }
  }, [])

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
          { namePrefix: " printer" },
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
    } catch (error: any) {
      let errorMessage = error.message || "Failed to scan for printers"
      
      if (error.name === "NotFoundError") {
        errorMessage = "No printer found. Make sure your printer is turned on and in pairing mode."
      } else if (error.name === "SecurityError") {
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
          printerAddress: config.printerAddress
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink dark:text-on-dark">{t("title")}</h1>
          <p className="text-shade-50 dark:text-shade-40">{t("description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
            <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
              <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                <Bluetooth className="w-5 h-5" />
                {t("bluetoothPrinter")}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {!isBluetoothSupported ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-800 dark:text-yellow-400 text-sm">
                  {t("bluetoothNotSupported")}
                </div>
              ) : (
                <>
                  <Button 
                    onClick={handleScanBluetooth} 
                    disabled={scanning}
                    className="w-full"
                  >
                    {scanning ? t("scanning") : t("scanPrinter")}
                  </Button>
                  
                  {scannedDevices.length > 0 && (
                    <div className="space-y-2">
                      <Label>{t("availablePrinters")}</Label>
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
                        <strong>{t("connectedTo")}:</strong> {config.printerName}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
            <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
              <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {t("receiptLogo")}
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
                  <Label>{t("uploadLogo")}</Label>
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
                  {t("removeLogo")}
                </Button>
              )}
            </div>
          </div>

          <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
            <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
              <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                <Save className="w-5 h-5" />
                {t("storeInfo")}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label>{t("storeName")}</Label>
                <Input 
                  value={config.storeName}
                  onChange={(e) => setConfig(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="Toko Anda"
                />
              </div>
              <div>
                <Label>{t("storeAddress")}</Label>
                <Input 
                  value={config.storeAddress}
                  onChange={(e) => setConfig(prev => ({ ...prev, storeAddress: e.target.value }))}
                  placeholder="Jl. Alamat No. 123"
                />
              </div>
              <div>
                <Label>{t("storePhone")}</Label>
                <Input 
                  value={config.storePhone}
                  onChange={(e) => setConfig(prev => ({ ...prev, storePhone: e.target.value }))}
                  placeholder="081234567890"
                />
              </div>
              <div>
                <Label>{t("paperWidth")}</Label>
                <select 
                  value={config.paperWidth}
                  onChange={(e) => setConfig(prev => ({ ...prev, paperWidth: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-night-elevated text-ink dark:text-on-dark rounded-xl"
                >
                  <option value={58}>58mm</option>
                  <option value={80}>80mm</option>
                </select>
              </div>
              
              <Button onClick={handleSave} className="w-full" disabled={saveStatus === "saving"}>
                {saveStatus === "saving" ? tCommon("loading") : saveStatus === "saved" ? t("saved") : t("saveConfig")}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl elevation-3 dark:elevation-1">
            <div className="px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
              <h2 className="font-bold text-ink dark:text-on-dark flex items-center gap-2">
                <PrinterIcon className="w-5 h-5" />
                {t("receiptPreview")}
              </h2>
            </div>
            <div className="p-5">
              <div 
                className="bg-canvas-light dark:bg-canvas-night-elevated border-2 border-hairline-light dark:border-hairline-dark rounded-sm p-4 mx-auto"
                style={{ 
                  width: config.paperWidth === 58 ? "280px" : "380px",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "11px",
                  color: "#000"
                }}
              >
                <div className="text-center border-b border-dashed border-hairline-light dark:border-hairline-dark pb-2 mb-2">
                  {config.logoUrl && (
                    <img src={config.logoUrl} alt="Logo" className="w-12 h-12 mx-auto mb-2 object-contain" />
                  )}
                  <div className="font-bold">{config.storeName || "CloudPOS"}</div>
                  <div className="text-xs">{config.storeAddress || "Jl. Toko No. 123"}</div>
                  <div className="text-xs">Telp: {config.storePhone || "081234567890"}</div>
                </div>
                
                <div className="text-xs mb-2">
                  4 Apr 2026 22:13 | Kasir: Admin
                </div>
                
                <div className="border-b border-dashed border-hairline-light dark:border-hairline-dark pb-2 mb-2">
                  {previewItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
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
                
                <div className="text-center border-t border-dashed border-hairline-light dark:border-hairline-dark pt-2 mt-2">
                  <div className="text-xs">Terima kasih atas kunjungan</div>
                  <div className="text-xs">Anda</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
