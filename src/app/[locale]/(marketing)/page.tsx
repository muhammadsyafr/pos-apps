"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"

export default function MarketingPage() {
  const params = useParams()
  const locale = params.locale as string
  const { data: session } = useSession()
  const isLoggedIn = !!session

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white signature-gradient">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-black font-headline tracking-tight text-slate-900 dark:text-slate-50">CloudPOS</span>
        </div>
        <Link
          href={isLoggedIn ? `/${locale}/dashboard` : `/${locale}/login`}
          className="px-6 py-2.5 signature-gradient text-white rounded-xl font-headline font-bold shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 transition-all"
        >
          {isLoggedIn ? "Dashboard" : "Sign In"}
        </Link>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tight text-slate-900 dark:text-slate-50 mb-6">
            Modern Point of Sale
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              for Growing Businesses
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Streamline your sales, manage inventory, and grow your business with our powerful, intuitive POS system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/login`}
              className="px-8 py-4 signature-gradient text-white rounded-xl font-headline font-bold text-lg shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
            <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-xl font-headline font-bold text-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              Learn More
            </button>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Lightning Fast</h3>
            <p className="text-slate-600 dark:text-slate-400">Process transactions in seconds with our optimized checkout flow.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Real-time Analytics</h3>
            <p className="text-slate-600 dark:text-slate-400">Track sales, inventory, and performance with detailed reports.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Secure & Reliable</h3>
            <p className="text-slate-600 dark:text-slate-400">Enterprise-grade security with 99.9% uptime guarantee.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
