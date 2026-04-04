"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 signature-gradient">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-slate-900">CloudPOS</h1>
          <p className="text-slate-500 font-medium mt-1">Enterprise Suite</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{t("signIn")}</h2>
          
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t("email")}</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                placeholder="admin@cloudpos.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t("password")}</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full signature-gradient text-white py-3 rounded-xl font-headline font-bold shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? tCommon("loading") : t("signIn")}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              Demo: admin@cloudpos.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
