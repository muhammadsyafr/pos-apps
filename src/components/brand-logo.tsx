import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand"

type LogoVariant = "marketing" | "app"

interface BrandLogoProps {
  /** "marketing" = green bg (nav/footer), "app" = dark bg (dashboard/pos/login) */
  variant?: LogoVariant
  /** Outer box size in px. Icon scales proportionally. */
  size?: number
  className?: string
}

export function BrandLogo({ variant = "app", size = 36, className = "" }: BrandLogoProps) {
  if (BRAND_LOGO) {
    const isRemote = BRAND_LOGO.startsWith("http://") || BRAND_LOGO.startsWith("https://")
    const src = isRemote || BRAND_LOGO.startsWith("/") ? BRAND_LOGO : `/${BRAND_LOGO}`
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={BRAND_NAME}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const rounded = size >= 56 ? "rounded-xl" : size >= 40 ? "rounded-lg" : "rounded-md"
  const bgClass = variant === "marketing" ? "bg-[#008060]" : "bg-ink dark:bg-on-dark"
  const iconClass = variant === "marketing" ? "text-white" : "text-on-primary dark:text-canvas-night"
  const iconSize = Math.round(size * 0.556)

  return (
    <div
      className={`flex items-center justify-center ${bgClass} ${rounded} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        style={{ width: iconSize, height: iconSize }}
        fill="currentColor"
        viewBox="0 0 24 24"
        className={iconClass}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  )
}
