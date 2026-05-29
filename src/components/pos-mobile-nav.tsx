"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, LogOut } from "lucide-react"

interface MobileNavProps {
  isAdmin: boolean
}

export function MobileNav({ isAdmin }: MobileNavProps) {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const locale = segments[1] || "en"

  const isActive = (path: string) => pathname.includes(path)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-canvas-light dark:bg-canvas-night-elevated border-t border-hairline-light dark:border-hairline-dark px-2 py-2 z-30">
      <div className="flex items-center justify-around">
        <Link
          href={`/${locale}/pos`}
          className={`flex flex-col items-center gap-1 px-6 py-2 -mt-4 rounded-full transition-all bg-ink dark:bg-on-dark text-on-primary dark:text-canvas-night shadow-lg`}
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-[10px] font-[550]">Sales</span>
        </Link>
        <Link
          href={`/${locale}/dashboard`}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-colors ${
            isActive('/dashboard')
              ? 'text-ink dark:text-on-dark bg-shade-30 dark:bg-white/10'
              : 'text-shade-50 dark:text-shade-40'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-colors text-shade-50 dark:text-shade-40"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  )
}
