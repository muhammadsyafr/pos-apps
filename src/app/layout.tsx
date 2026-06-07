import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "@daypicker/react/style.css"
import "./globals.css"
import { Providers } from "@/components/providers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getLocale } from "next-intl/server"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeScript } from "@/lib/theme-script"
import { PWARegister } from "@/components/pwa-register"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

import { BRAND_NAME } from "@/lib/brand"

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Point of Sale & Inventory`,
  description: "Enterprise-grade point of sale and inventory management",
  icons: { icon: "/favicon.svg", apple: "/assets/logo.svg" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND_NAME,
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a18",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <PWARegister />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
