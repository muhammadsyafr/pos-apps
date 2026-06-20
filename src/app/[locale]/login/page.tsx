"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { BrandLogo } from "@/components/brand-logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

    const destination = session?.user?.role === "ADMIN" ? "dashboard" : "pos"
    router.push(`/${locale}/${destination}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canvas-cream via-aloe-10/30 to-canvas-cream dark:from-canvas-night dark:via-canvas-night-elevated dark:to-canvas-night px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <BrandLogo variant="app" size={48} className="mx-auto mb-6" />
          <h1 className="font-display font-[500] text-[28px] leading-[1.2] tracking-[0.2px] text-ink dark:text-on-dark">
            {t("signIn")}
          </h1>
          <p className="font-[420] text-[15px] leading-[1.5] text-shade-50 dark:text-shade-40 mt-2">
            {t("continueTo", { brand: BRAND_NAME })}
          </p>
        </div>

        <div className="bg-canvas-light dark:bg-canvas-night-elevated rounded-2xl border border-hairline-light dark:border-hairline-dark p-6 sm:p-8 elevation-2 dark:elevation-1">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg font-[420] text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-[550] text-ink dark:text-on-dark">
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                placeholder="admin@cloudpos.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-[550] text-ink dark:text-on-dark">
                  {t("password")}
                </Label>
                <a
                  href="#"
                  className="text-sm font-[500] text-shade-50 dark:text-shade-40 hover:text-ink dark:hover:text-on-dark transition-colors"
                >
                  {t("forgotPassword")}
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
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

        <p className="text-center text-sm font-[420] text-shade-50 dark:text-shade-40 mt-6">
          {t("noAccount", { brand: BRAND_NAME })}{" "}
          <a
            href="#"
            className="font-[550] text-ink dark:text-on-dark hover:underline underline-offset-4"
          >
            {t("signUp")}
          </a>
        </p>
      </div>
    </div>
  )
}
