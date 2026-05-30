/**
 * Bluetooth thermal printer service.
 *
 * Exports a module-level singleton `bluetoothPrinter` that persists
 * across Next.js client-side navigations. The printer settings page
 * calls `connect()` after scanning; the POS and Reports pages call
 * `print()` directly without needing a new user gesture.
 *
 * Common BLE GATT service/characteristic profiles for cheap thermal
 * printers (Xprinter, ZJ-58, Peripage, etc.):
 *   - 0000ffe0 / 0000ffe1  (most popular SPP-clone)
 *   - e7810a71 / bef8d6c9  (some Epson mPOS)
 *   - 49535343-fe7d / 49535343-1e4d (Microchip RN42)
 */

import { EscPos, COLS_58MM, COLS_80MM } from "./escpos"
import { formatIDR } from "./currency"

/** Compact currency for receipt printing — strips the NBSP between "Rp" and digits */
function fmtIDR(amount: number): string {
  return formatIDR(amount).replace(/\u00a0/g, "")
}

// ── Known BLE profiles ────────────────────────────────────────────────────────
// Listed in priority order. The first matching profile wins.

const PRINTER_PROFILES: Array<{ service: string; characteristic: string; label?: string }> = [
  {
    // Rongta RPP02N / RPP300 / RPP301 and most Rongta BLE printers
    label: "Rongta",
    service: "0000ff00-0000-1000-8000-00805f9b34fb",
    characteristic: "0000ff02-0000-1000-8000-00805f9b34fb",
  },
  {
    // HM-10 / JDY-08 BLE UART clone (many cheap Chinese thermal printers)
    label: "FFE0/FFE1",
    service: "0000ffe0-0000-1000-8000-00805f9b34fb",
    characteristic: "0000ffe1-0000-1000-8000-00805f9b34fb",
  },
  {
    // Epson TM-P20 / TM-P60II mPOS BLE
    label: "Epson mPOS",
    service: "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
    characteristic: "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
  },
  {
    // Microchip RN42 / Star Micronics and similar
    label: "RN42/Star",
    service: "49535343-fe7d-4ae5-8fa9-9fafd205e455",
    characteristic: "49535343-1e4d-4bd9-ba61-23c647249616",
  },
]

// All known service UUIDs – passed to requestDevice so the browser
// allows them to be accessed post-connection.
export const ALL_OPTIONAL_SERVICES = PRINTER_PROFILES.map((p) => p.service)

// ── Receipt data shape ────────────────────────────────────────────────────────

export interface ReceiptData {
  storeName: string
  storeAddress: string
  storePhone: string
  logoUrl?: string | null
  dateStr: string
  timeStr: string
  cashierName: string
  saleId?: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  paymentMethod: string
  cashPaid?: number
  change?: number
  paperWidth: number
  footerText?: string
}

/**
 * Convert a logo image (data URL or URL) into ESC/POS GS-v-0 raster bytes.
 * The logo is scaled to fit within `maxLogoDots` px, then centered on a canvas
 * that spans the full `printerDotWidth` so the bytesPerLine sent to the printer
 * always matches its native paper width (avoids garbled/broken output on printers
 * that expect a fixed line width regardless of image size).
 */
async function logoToEscPosBytes(
  url: string,
  maxLogoDots: number,
  printerDotWidth: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Scale logo to fit within maxLogoDots in both dimensions
      const scale = Math.min(1, maxLogoDots / img.width, maxLogoDots / img.height)
      const logoW = Math.floor(img.width * scale)
      const logoH = Math.floor(img.height * scale)
      if (logoW === 0 || logoH === 0) { reject(new Error("Logo scaled to zero")); return }

      // Canvas width = full printer dot width, aligned to 8 bits
      const bytesPerLine = Math.ceil(printerDotWidth / 8)
      const canvasW = bytesPerLine * 8

      // Center the logo horizontally within the full canvas
      const xOffset = Math.max(0, Math.floor((canvasW - logoW) / 2))

      const canvas = document.createElement("canvas")
      canvas.width = canvasW
      canvas.height = logoH
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvasW, logoH)
      ctx.drawImage(img, xOffset, 0, logoW, logoH)

      const pixels = ctx.getImageData(0, 0, canvasW, logoH).data
      const rasterLen = bytesPerLine * logoH
      const result = new Uint8Array(8 + rasterLen)
      // GS v 0 header
      result[0] = 0x1d; result[1] = 0x76; result[2] = 0x30; result[3] = 0x00
      result[4] = bytesPerLine & 0xff; result[5] = (bytesPerLine >> 8) & 0xff
      result[6] = logoH & 0xff;        result[7] = (logoH >> 8) & 0xff
      // Raster data
      let pos = 8
      for (let y = 0; y < logoH; y++) {
        for (let bx = 0; bx < bytesPerLine; bx++) {
          let byte = 0
          for (let bit = 0; bit < 8; bit++) {
            const x = bx * 8 + bit
            const idx = (y * canvasW + x) * 4
            const lum = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]
            if (lum < 128) byte |= 0x80 >> bit
          }
          result[pos++] = byte
        }
      }
      resolve(result)
    }
    img.onerror = reject
    img.src = url
  })
}

// ── Service class ─────────────────────────────────────────────────────────────

class BluetoothPrinterService {
  private _device: BluetoothDevice | null = null
  private _char: BluetoothRemoteGATTCharacteristic | null = null
  private _connecting = false

  // ── State accessors ─────────────────────────────────────────────────────────

  get isConnected(): boolean {
    return !!(this._device?.gatt?.connected && this._char)
  }

  get deviceName(): string | null {
    return this._device?.name ?? null
  }

  // ── Connect / disconnect ────────────────────────────────────────────────────

  /**
   * Connect to a previously scanned BluetoothDevice and locate the
   * first compatible write characteristic.
   */
  async connect(device: BluetoothDevice): Promise<void> {
    if (this._connecting) return
    this._connecting = true
    try {
      // Disconnect previous device if any
      if (this._device?.gatt?.connected) {
        this._device.gatt.disconnect()
      }

      this._device = device
      this._char = null

      const server = await device.gatt!.connect()

      for (const profile of PRINTER_PROFILES) {
        try {
          const service = await server.getPrimaryService(profile.service)
          const char = await service.getCharacteristic(profile.characteristic)
          this._char = char
          break
        } catch {
          // profile not supported by this device – try next
        }
      }

      if (!this._char) {
        throw new Error(
          "No compatible print service found on this printer. " +
            "Make sure the printer is a BLE thermal printer."
        )
      }
    } finally {
      this._connecting = false
    }
  }

  /** Disconnect from the current printer */
  async disconnect(): Promise<void> {
    if (this._device?.gatt?.connected) {
      this._device.gatt.disconnect()
    }
    this._char = null
  }

  // ── Send data ───────────────────────────────────────────────────────────────

  /**
   * Send raw ESC/POS bytes to the printer.
   * Splits into 200-byte chunks to stay within BLE MTU limits.
   */
  async print(data: Uint8Array): Promise<void> {
    if (!this._char) {
      throw new Error("Printer not connected. Please connect from Printer Settings.")
    }
    // Re-connect if GATT session dropped (e.g. device went to sleep)
    if (!this._device?.gatt?.connected) {
      await this._device!.gatt!.connect()
    }

    const CHUNK = 200
    for (let i = 0; i < data.length; i += CHUNK) {
      await this._char.writeValue(data.slice(i, i + CHUNK))
    }
  }

  // ── Receipt builder ─────────────────────────────────────────────────────────

  /**
   * Convert structured receipt data into an ESC/POS byte buffer
   * ready to be sent to the printer.
   */
  async buildReceipt(r: ReceiptData): Promise<Uint8Array> {
    const cols = r.paperWidth === 80 ? COLS_80MM : COLS_58MM
    const maxLogoDots = r.paperWidth === 80 ? 160 : 120
    // Full printable dot width per paper size (203 dpi, standard thermal printer)
    const printerDotWidth = r.paperWidth === 80 ? 576 : 384
    const p = new EscPos()

    // Initialise
    p.init()

    // ── Logo ──────────────────────────────────────────────────────────────────
    if (r.logoUrl) {
      try {
        const logoBytes = await logoToEscPosBytes(r.logoUrl, maxLogoDots, printerDotWidth)
        p.rawBytes(logoBytes)
        p.line("")
      } catch {
        // Logo conversion failed – skip silently
      }
    }

    // ── Header ────────────────────────────────────────────────────────────────
    p.align(1)
    p.bold(true).fontSize(0x11) // double size
    p.line(r.storeName || "CloudPOS")
    p.fontSize(0x00).bold(false)
    if (r.storeAddress) p.line(r.storeAddress)
    if (r.storePhone) p.line("Telp: " + r.storePhone)

    // ── Transaction meta ──────────────────────────────────────────────────────
    p.align(0)
    p.divider(cols)
    p.rowPair(r.dateStr, r.timeStr, cols)
    p.line("Kasir: " + r.cashierName)
    if (r.saleId) p.line("ID: " + r.saleId.slice(0, 8))
    p.divider(cols)

    // ── Line items ────────────────────────────────────────────────────────────
    for (const item of r.items) {
      const amount = fmtIDR(item.price * item.quantity)
      const maxLabel = cols - amount.length - 1
      let label = `${item.name} x${item.quantity}`
      if (label.length > maxLabel) label = label.slice(0, maxLabel - 3) + "..."
      p.rowPair(label, amount, cols)
    }
    p.divider(cols)

    // ── Totals ────────────────────────────────────────────────────────────────
    p.bold(true)
    p.rowPair("TOTAL", fmtIDR(r.total), cols)
    p.bold(false)

    if (r.paymentMethod === "CASH") {
      p.rowPair("Tunai", fmtIDR(r.cashPaid ?? 0), cols)
      p.rowPair("Kembalian", fmtIDR(r.change ?? 0), cols)
    } else {
      p.rowPair("Metode", r.paymentMethod, cols)
    }
    p.divider(cols)

    // ── Footer ────────────────────────────────────────────────────────────────
    p.align(1)
    const footer = r.footerText ?? "Terima kasih atas\nkunjungan Anda"
    for (const line of footer.split("\n")) {
      if (line.trim()) p.line(line.trim())
    }

    // Feed + partial cut
    p.feedAndCut(1)
    return p.bytes()
  }

  /**
   * Build a plain-text receipt string (no ESC/POS binary codes).
   * Used for the iOS Share Sheet path where the binary is unreadable.
   */
  buildPlainTextReceipt(r: ReceiptData): string {
    const cols = r.paperWidth === 80 ? COLS_80MM : COLS_58MM
    const div = "-".repeat(cols)

    const center = (s: string) => {
      const pad = Math.max(0, Math.floor((cols - s.length) / 2))
      return " ".repeat(pad) + s
    }
    const row = (left: string, right: string) => {
      const gap = cols - left.length - right.length
      return left + " ".repeat(Math.max(1, gap)) + right
    }

    const lines: string[] = []

    lines.push(center(r.storeName || "CloudPOS"))
    if (r.storeAddress) lines.push(center(r.storeAddress))
    if (r.storePhone) lines.push(center("Telp: " + r.storePhone))
    lines.push(div)
    lines.push(row(r.dateStr, r.timeStr))
    lines.push("Kasir: " + r.cashierName)
    if (r.saleId) lines.push("ID: " + r.saleId.slice(0, 8))
    lines.push(div)

    for (const item of r.items) {
      const amount = fmtIDR(item.price * item.quantity)
      const maxLabel = cols - amount.length - 1
      let label = `${item.name} x${item.quantity}`
      if (label.length > maxLabel) label = label.slice(0, maxLabel - 3) + "..."
      lines.push(row(label, amount))
    }
    lines.push(div)
    lines.push(row("TOTAL", fmtIDR(r.total)))
    if (r.paymentMethod === "CASH") {
      lines.push(row("Tunai", fmtIDR(r.cashPaid ?? 0)))
      lines.push(row("Kembalian", fmtIDR(r.change ?? 0)))
    } else {
      lines.push(row("Metode", r.paymentMethod))
    }
    lines.push(div)

    const footer = r.footerText ?? "Terima kasih atas\nkunjungan Anda"
    for (const line of footer.split("\n")) {
      if (line.trim()) lines.push(center(line.trim()))
    }

    return lines.join("\n") + "\n"
  }

  /**
   * Print a short test pattern to verify the connection works.
   */
  buildTestReceipt(paperWidth: number): Uint8Array {
    const cols = paperWidth === 80 ? COLS_80MM : COLS_58MM
    const p = new EscPos()
    p.init()
    p.align(1).bold(true).line("PRINTER TEST").bold(false)
    p.align(0).divider(cols)
    p.line("CloudPOS Bluetooth Print")
    p.line("Test receipt - OK")
    p.divider(cols)
    p.align(1).line("Printer is working!")
    p.feedAndCut(4)
    return p.bytes()
  }

  // ── RawBT (Android Classic Bluetooth) ──────────────────────────────────────

  /**
   * Returns true when running on an Android device.
   */
  isAndroid(): boolean {
    if (typeof navigator === "undefined") return false
    return /Android/i.test(navigator.userAgent)
  }

  /**
   * Returns true when running on an iOS device (iPhone, iPad, iPod).
   * Also detects iPadOS 13+ which reports as MacIntel with touch support.
   */
  isIOS(): boolean {
    if (typeof navigator === "undefined") return false
    return (
      /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    )
  }

  /**
   * Share the ESC/POS binary blob via the Web Share API so the user can
   * pick RawBT from the Android share sheet.
   *
   * This is the most reliable approach — it uses the same "open with RawBT"
   * flow that the user confirmed works (sharing a file from the file manager).
   *
   * Falls back to downloading the .bin file if Web Share is unavailable.
   */
  async printViaRawBT(data: Uint8Array): Promise<void> {
    const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/octet-stream" })
    const file = new File([blob], "receipt.bin", { type: "application/octet-stream" })

    // Web Share API — shows the native Android share sheet (memory-only, no disk write).
    // Don't gate on canShare() — it returns false for octet-stream on many Android versions.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ files: [file] })
        return
      } catch (err) {
        if ((err as Error).name === "AbortError") return // user dismissed
        // share failed (e.g. desktop browser) — fall through
      }
    }

    // Desktop fallback: open blob URL in new tab so the browser handles it
    // (no file saved to disk — the blob lives only in memory).
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  /**
   * Share a plain-text receipt as a .txt file via the iOS Share Sheet.
   * text/plain files can be opened by Files, Notes, Printer Pro, etc.
   * Falls back to opening the file in a new tab (downloads it).
   */
  async printViaIOSShareSheet(text: string): Promise<void> {
    const blob = new Blob([text], { type: "text/plain" })
    const file = new File([blob], "receipt.txt", { type: "text/plain" })

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ files: [file] })
        return
      } catch (err) {
        if ((err as Error).name === "AbortError") return // user dismissed
      }
    }

    // Fallback: open the text in a new tab
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const bluetoothPrinter = new BluetoothPrinterService()
