/**
 * ESC/POS command builder for thermal receipt printers.
 * Column widths: 58mm paper ≈ 32 chars, 80mm paper ≈ 42 chars.
 */

const ESC = 0x1b
const GS = 0x1d
const LF = 0x0a
const CR = 0x0d

export const COLS_58MM = 32
export const COLS_80MM = 42

export class EscPos {
  private data: number[] = []

  /** Initialize / reset printer */
  init(): this {
    return this.raw(ESC, 0x40)
  }

  /** Set text alignment: 0=left, 1=center, 2=right */
  align(n: 0 | 1 | 2): this {
    return this.raw(ESC, 0x61, n)
  }

  /** Toggle bold */
  bold(on: boolean): this {
    return this.raw(ESC, 0x45, on ? 1 : 0)
  }

  /**
   * Double-width + double-height text.
   * n: 0=normal, 0x11=double width+height (not all printers support this).
   */
  fontSize(n: number): this {
    return this.raw(ESC, 0x21, n)
  }

  /** Append raw text bytes (no newline) */
  text(str: string): this {
    for (let i = 0; i < str.length; i++) {
      // Only printable Latin-1 range; replace beyond 0xff with '?'
      const code = str.charCodeAt(i)
      this.data.push(code <= 0xff ? code : 0x3f)
    }
    return this
  }

  /** Append text followed by CR+LF (compatible with all thermal printers) */
  line(str = ""): this {
    return this.text(str).raw(CR, LF)
  }

  /** Print a full-width dashed divider */
  divider(cols: number): this {
    return this.line("-".repeat(cols))
  }

  /**
   * Print a two-column row: left-aligned label, right-aligned value.
   * Fills the space between with spaces to reach `cols` total width.
   */
  rowPair(left: string, right: string, cols: number): this {
    const gap = cols - left.length - right.length
    if (gap <= 0) {
      // Truncate left so right always fits
      const truncated = left.slice(0, cols - right.length - 1)
      return this.line(truncated + " " + right)
    }
    return this.line(left + " ".repeat(gap) + right)
  }

  /**
   * Feed n extra lines then perform a partial paper cut.
   * ESC d n  → feed n lines
   * GS  V 1  → partial cut
   */
  feedAndCut(lines = 4): this {
    return this.raw(ESC, 0x64, lines, GS, 0x56, 0x01)
  }

  private raw(...bytes: number[]): this {
    this.data.push(...bytes)
    return this
  }

  /** Return the complete command buffer as a Uint8Array */
  bytes(): Uint8Array {
    return new Uint8Array(this.data)
  }
}
