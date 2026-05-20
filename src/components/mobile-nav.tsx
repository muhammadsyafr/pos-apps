"use client"

import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, Package, MoreHorizontal } from "lucide-react"
import { useState } from "react"

export function MobileNav() {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const locale = segments[1] || "en"
  const [showMore, setShowMore] = useState(false)
  const { data: session } = useSession()
  const isCashier = session?.user?.role === "CASHIER"

  const isActive = (path: string) => pathname.includes(path)

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          <a 
            href={`/${locale}/dashboard`} 
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/dashboard') && !isActive('/dashboard/') 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </a>
          
          {!isCashier && (
            <a 
              href={`/${locale}/dashboard/inventory`} 
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive('/inventory') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-medium">Stock</span>
            </a>
          )}
          
          <a 
            href={`/${locale}/pos`} 
            className={`flex flex-col items-center gap-1 px-6 py-2 -mt-4 rounded-2xl transition-all ${
              pathname === `/${locale}/pos`
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50' 
                : 'bg-blue-600 text-white shadow-lg'
            }`}
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-[10px] font-bold">Sales</span>
          </a>
          
          {!isCashier && (
            <a 
              href={`/${locale}/dashboard/reports`} 
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive('/reports') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
              <span className="text-[10px] font-medium">Reports</span>
            </a>
          )}
          
          <button 
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              showMore 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {showMore && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setShowMore(false)} />
          <div className="lg:hidden fixed bottom-16 right-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 w-48">
            <div className="py-2">
              {!isCashier && (
                <a 
                  href={`/${locale}/dashboard/categories`}
                  onClick={() => setShowMore(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" /></svg>
                  Categories
                </a>
              )}
              <a 
                href={`/${locale}/dashboard/settings`}
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
                Settings
              </a>
            </div>
          </div>
        </>
      )}
    </>
  )
}
