"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatIDR } from "@/lib/currency"
import { bluetoothPrinter, ALL_OPTIONAL_SERVICES } from "@/lib/bluetooth-printer"
import { Printer, Bluetooth, Upload, Save, PrinterIcon, Loader2, CheckCircle2, XCircle, Smartphone, ExternalLink } from "lucide-react"

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
    printerAddress: null,
    footerText: "Terima kasih atas\nkunjungan Anda"
  })
  
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanMode, setScanMode] = useState<"filtered" | "all">("filtered")
  const [scannedDevices, setScannedDevices] = useState<BluetoothDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [testPrinting, setTestPrinting] = useState(false)
  const [printerTab, setPrinterTab] = useState<"rawbt" | "ios" | "ble">("rawbt")
  
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
        setConfig({
          ...data,
          footerText: data.footerText ?? "Terima kasih atas\nkunjungan Anda"
        })
      } catch (error) {
        console.error("Failed to fetch printer settings:", error)
      }
    }
    fetchConfig()
    
    if (typeof window !== "undefined" && !navigator.bluetooth) {
      setIsBluetoothSupported(false)
    }
    // Reflect singleton connection state on mount
    if (bluetoothPrinter.isConnected) {
      setConnectionStatus("connected")
    }
  }, [])

  const handleScanBluetooth = async (mode: "filtered" | "all" = "all") => {
    setScanning(true)
    setScanMode(mode)
    setScannedDevices([])
    setConnectionStatus("idle")
    setConnectionError(null)
    
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth is not available. Please enable it in chrome://flags or use a supported browser.")
      }
      
      // Always use acceptAllDevices so any printer shows up regardless of its
      // advertised name. The user picks their device from the browser dialog.
      const requestOptions: BluetoothRequestDeviceOptions = {
        acceptAllDevices: true,
        optionalServices: ALL_OPTIONAL_SERVICES,
      }

      const device = await navigator.bluetooth.requestDevice(requestOptions)
      
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
        // User cancelled the picker — not a real error, just return silently
        return
      } else if (error.name === "SecurityError") {
        errorMessage = "Bluetooth permission denied. Please allow Bluetooth access when prompted."
      } else if (errorMessage.includes("Web Bluetooth")) {
        errorMessage = "Web Bluetooth API is disabled. Please enable it in chrome://flags '#enable-experimental-web-platform-features' or use Chrome/Edge browser."
        setIsBluetoothSupported(false)
      }
      
      alert(errorMessage)
    } finally {
      setScanning(false)
    }
  }

  const handleConnect = async () => {
    if (!selectedDevice) return
    setConnectionStatus("connecting")
    setConnectionError(null)
    try {
      await bluetoothPrinter.connect(selectedDevice)
      setConnectionStatus("connected")
    } catch (err: any) {
      setConnectionStatus("error")
      setConnectionError(err.message || "Connection failed")
    }
  }

  const handleDisconnect = async () => {
    await bluetoothPrinter.disconnect()
    setConnectionStatus("idle")
    setConnectionError(null)
  }

  const handleTestPrint = async () => {
    setTestPrinting(true)
    try {
      const data = bluetoothPrinter.buildTestReceipt(config.paperWidth)
      await bluetoothPrinter.print(data)
    } catch (err: any) {
      alert("Test print failed: " + (err.message || "Unknown error"))
    } finally {
      setTestPrinting(false)
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
              {/* Tab switcher */}
              <div className="flex rounded-lg border border-hairline-light dark:border-hairline-dark overflow-hidden text-sm font-medium">
                <button
                  onClick={() => setPrinterTab("rawbt")}
                  className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 transition-colors ${
                    printerTab === "rawbt"
                      ? "bg-ink text-white dark:bg-white dark:text-ink"
                      : "hover:bg-shade-30 dark:hover:bg-white/5 text-shade-70 dark:text-shade-40"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  {t("androidRawBT")}
                </button>
                <button
                  onClick={() => setPrinterTab("ios")}
                  className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 transition-colors border-l border-hairline-light dark:border-hairline-dark ${
                    printerTab === "ios"
                      ? "bg-ink text-white dark:bg-white dark:text-ink"
                      : "hover:bg-shade-30 dark:hover:bg-white/5 text-shade-70 dark:text-shade-40"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  {t("iosAirPrint")}
                </button>
                <button
                  onClick={() => setPrinterTab("ble")}
                  className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 transition-colors border-l border-hairline-light dark:border-hairline-dark ${
                    printerTab === "ble"
                      ? "bg-ink text-white dark:bg-white dark:text-ink"
                      : "hover:bg-shade-30 dark:hover:bg-white/5 text-shade-70 dark:text-shade-40"
                  }`}
                >
                  <Bluetooth className="w-4 h-4" />
                  {t("bleAdvanced")}
                </button>
              </div>

              {/* ── iOS / AirPrint tab ── */}
              {printerTab === "ios" && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl space-y-3 text-sm text-blue-900 dark:text-blue-200">
                    <p className="font-semibold">{t("iosSetupTitle")}</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>{t("iosStep1")}</li>
                      <li>{t("iosStep2")}</li>
                      <li>{t("iosStep3")}</li>
                    </ol>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                    {t("iosNoBluetooth")}
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-800 dark:text-green-300">
                    {t("iosAirPrintHint")}
                  </div>
                </div>
              )}

              {/* ── Android / RawBT tab ── */}
              {printerTab === "rawbt" && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl space-y-3 text-sm text-blue-900 dark:text-blue-200">
                    <p className="font-semibold">{t("rawbtSetupTitle")}</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>{t("rawbtStep1")}</li>
                      <li>{t("rawbtStep2")}</li>
                      <li>{t("rawbtStep3")}</li>
                    </ol>
                  </div>

                  <a
                    href="https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-hairline-light dark:border-hairline-dark text-sm font-medium hover:bg-shade-30 dark:hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t("installRawBT")}
                  </a>

                  <Button
                    onClick={async () => {
                      setTestPrinting(true)
                      try {
                        const text = bluetoothPrinter.buildTestReceipt(config.paperWidth)
                        bluetoothPrinter.printViaRawBT(text)
                      } finally {
                        setTestPrinting(false)
                      }
                    }}
                    disabled={testPrinting}
                    className="w-full"
                  >
                    {testPrinting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("printing")}</>
                    ) : (
                      <><Printer className="w-4 h-4 mr-2" />{t("testPrintRawBT")}</>
                    )}
                  </Button>
                </div>
              )}

              {/* ── BLE (advanced) tab ── */}
              {printerTab === "ble" && (
                <>
                  {!isBluetoothSupported ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-800 dark:text-yellow-400 text-sm">
                      {t("bluetoothNotSupported")}
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={() => handleScanBluetooth()}
                        disabled={scanning || connectionStatus === "connecting"}
                        className="w-full"
                      >
                        {scanning ? t("scanning") : t("scanPrinter")}
                      </Button>

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                        {t("rpp02nHint")}
                      </div>
                      
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

                      {selectedDevice && connectionStatus !== "connected" && (
                        <Button
                          onClick={handleConnect}
                          disabled={connectionStatus === "connecting"}
                          className="w-full"
                          variant="outline-light"
                        >
                          {connectionStatus === "connecting" ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("connecting")}</>
                          ) : (
                            <><Bluetooth className="w-4 h-4 mr-2" />{t("connect")}</>
                          )}
                        </Button>
                      )}

                      {connectionError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-red-800 dark:text-red-400">{connectionError}</p>
                        </div>
                      )}

                      {connectionStatus === "connected" && (
                        <div className="space-y-2">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                            <p className="text-sm text-green-800 dark:text-green-400">
                              <strong>{t("connectedTo")}:</strong> {bluetoothPrinter.deviceName ?? config.printerName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleTestPrint}
                              disabled={testPrinting}
                              variant="outline-light"
                              className="flex-1"
                            >
                              {testPrinting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("printing")}</>
                              ) : (
                                <><Printer className="w-4 h-4 mr-2" />{t("testPrint")}</>
                              )}
                            </Button>
                            <Button
                              onClick={handleDisconnect}
                              variant="outline-light"
                              className="flex-1"
                            >
                              {t("disconnect")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
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
              <div>
                wkowkowko
                <Label>{t("footerText")}</Label>
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
              {(() => {
                const cols = config.paperWidth === 80 ? 42 : 32
                const divider = "-".repeat(cols)
                const fmtIDR = (n: number) => formatIDR(n).replace(/\u00a0/g, "")
                const rowPair = (left: string, right: string) => {
                  const gap = cols - left.length - right.length
                  if (gap <= 0) return left.slice(0, cols - right.length - 1) + " " + right
                  return left + " ".repeat(gap) + right
                }
                const centerStr = (s: string) => {
                  const pad = Math.max(0, Math.floor((cols - s.length) / 2))
                  return " ".repeat(pad) + s
                }

                const textLines: string[] = []
                // Header
                textLines.push(centerStr(config.storeName || "CloudPOS"))
                if (config.storeAddress) textLines.push(centerStr(config.storeAddress))
                if (config.storePhone) textLines.push(centerStr("Telp: " + config.storePhone))
                textLines.push(divider)
                // Meta
                textLines.push(rowPair("29 May 2026", "22:13"))
                textLines.push("Kasir: Admin")
                textLines.push(divider)
                // Items
                for (const item of previewItems) {
                  const amount = fmtIDR(item.price * item.quantity)
                  const maxLabel = cols - amount.length - 1
                  let label = `${item.name} x${item.quantity}`
                  if (label.length > maxLabel) label = label.slice(0, maxLabel - 3) + "..."
                  textLines.push(rowPair(label, amount))
                }
                textLines.push(divider)
                // Totals
                textLines.push(rowPair("TOTAL", fmtIDR(previewSubtotal)))
                textLines.push(rowPair("Tunai", fmtIDR(previewCash)))
                textLines.push(rowPair("Kembalian", fmtIDR(previewChange)))
                textLines.push(divider)
                // Footer
                const footerLines = (config.footerText || "Terima kasih atas\nkunjungan Anda").split("\n")
                for (const fl of footerLines) {
                  if (fl.trim()) textLines.push(centerStr(fl.trim()))
                }

                return (
                  <div
                    className="bg-white rounded-sm mx-auto overflow-x-auto"
                    style={{ width: config.paperWidth === 58 ? "280px" : "380px" }}
                  >
                    {config.logoUrl && (
                      <div className="text-center pt-3">
                        <img src={config.logoUrl} alt="Logo" className="w-12 h-12 mx-auto object-contain" />
                      </div>
                    )}
                    <pre
                      style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: "11px",
                        color: "#111",
                        lineHeight: "1.6",
                        margin: 0,
                        padding: "12px",
                        whiteSpace: "pre",
                        overflowX: "auto",
                      }}
                    >
                      {textLines.join("\n")}
                    </pre>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
