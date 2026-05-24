import { getRequestConfig } from "next-intl/server"

export const locales = ["en", "id"] as const
export type Locale = (typeof locales)[number]
const defaultLocale: Locale = "en"

export default getRequestConfig(async ({ requestLocale }) => {
  const rawLocale = (await requestLocale) || ""
  const normalizedLocale = rawLocale.split("/").filter(Boolean)[0]

  const locale = locales.includes(normalizedLocale as Locale)
    ? (normalizedLocale as Locale)
    : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
