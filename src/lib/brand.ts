// NEXT_PUBLIC_ prefix is required so these values are available in client components.
// Set them in .env.local:
//   NEXT_PUBLIC_BRAND_NAME=MyStore
//   NEXT_PUBLIC_BRAND_LOGO=/my-logo.png   (relative to /public) or a full https:// URL
export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME ?? "CloudPOS"
export const BRAND_LOGO = process.env.NEXT_PUBLIC_BRAND_LOGO ?? null
