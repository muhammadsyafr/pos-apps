"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { BrandLogo } from "@/components/brand-logo"
import { BRAND_NAME } from "@/lib/brand"

export default function LoginPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations("auth")
  const tCommon = useTranslations("common")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", { email, password, redirect: false })

    if (result?.error) {
      setError(t("invalidCredentials"))
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/session")
    const session = await res.json()

    if (session?.user?.role === "ADMIN") {
      router.push(`/${locale}/dashboard`)
    } else {
      router.push(`/${locale}/pos`)
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-cream dark:bg-canvas-night p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <BrandLogo variant="app" size={64} className="mx-auto mb-4" />
          <h1 className="font-display font-[330] text-[55px] leading-[1.16] text-ink dark:text-on-dark">
            {BRAND_NAME}
          </h1>
          <p className="font-[420] text-[16px] leading-[1.5] text-shade-50 dark:text-shade-40 mt-1">
            Enterprise Suite
          </p>
        </div>

        <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-xl p-8 elevation-3 dark:elevation-1">
          <h2 className="font-display font-[500] text-[24px] leading-[1.14] tracking-[0.36px] text-ink dark:text-on-dark mb-6">
            {t("signIn")}
          </h2>

          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg font-[420] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block font-[550] text-[16px] leading-[1.5] text-ink dark:text-on-dark mb-2">
                {t("email")}
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-night text-ink dark:text-on-dark font-[420] text-[16px] leading-[1.5] focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink transition-all placeholder:text-shade-50 dark:placeholder:text-shade-50"
                placeholder="admin@cloudpos.com"
              />
            </div>

            <div>
              <label className="block font-[550] text-[16px] leading-[1.5] text-ink dark:text-on-dark mb-2">
                {t("password")}
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-night text-ink dark:text-on-dark font-[420] text-[16px] leading-[1.5] focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink transition-all placeholder:text-shade-50 dark:placeholder:text-shade-50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-pill disabled:opacity-50"
            >
              {loading ? tCommon("loading") : t("signIn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
