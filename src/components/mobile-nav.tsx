"use client"

import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const locale = segments[1] || "en"

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-2 py-2 z-30">
      <div className="flex items-center justify-around">
        <a href={`/${locale}/dashboard`} className="flex flex-col items-center gap-1 px-3 py-2 text-blue-600 dark:text-blue-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
          <span className="text-[10px] font-medium">Dashboard</span>
        </a>
        <a href={`/${locale}/pos`} className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 5H7v2h2V5zm4 8h-2v2h2v-2zm-8 2h2v-2H5v2zm10-4h2v2h-2v-2zm-4 0h2v-2h-2v2zm0-4h2V7h-2v2zm-4 2h2v-2H7v2zm8 0h2v-2h-2v2zm0 4h2v-2h-2v2zm-4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm-8-8h2v-2H7v2zm0 4h2v-2H7v2z" /></svg>
          <span className="text-[10px] font-medium">Sales</span>
        </a>
        <a href={`/${locale}/dashboard/inventory`} className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1 0-2 1-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1-1-2-2-2z" /></svg>
          <span className="text-[10px] font-medium">Inventory</span>
        </a>
        <a href={`/${locale}/dashboard/categories`} className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" /></svg>
          <span className="text-[10px] font-medium">Categories</span>
        </a>
        <button 
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex flex-col items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  )
}
