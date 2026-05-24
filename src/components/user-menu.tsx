"use client"

import { signOut } from "next-auth/react"
import { LogOut, User, Settings, ChevronDown } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

interface UserMenuProps {
  userName: string
  userRole: string
}

export function UserMenu({ userName, userRole }: UserMenuProps) {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const locale = segments[1] || "en"
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 lg:pl-4 border-l border-hairline-light dark:border-hairline-dark hover:bg-shade-30/50 dark:hover:bg-white/5 rounded-full py-1 pr-2 transition-colors"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-[550] text-ink dark:text-on-dark">{userName}</p>
          <p className="text-[10px] text-shade-50 dark:text-shade-40">{userRole}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-ink dark:bg-on-dark flex items-center justify-center text-on-primary dark:text-canvas-night font-[550] text-sm">
          {userName?.charAt(0).toUpperCase()}
        </div>
        <ChevronDown className={`w-4 h-4 text-shade-50 dark:text-shade-40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-48 bg-canvas-light dark:bg-canvas-night-elevated rounded-xl shadow-xl border border-hairline-light dark:border-hairline-dark z-50">
            <div className="px-4 py-3 border-b border-hairline-light dark:border-hairline-dark">
              <p className="text-sm font-[550] text-ink dark:text-on-dark">{userName}</p>
              <p className="text-xs text-shade-50 dark:text-shade-40">{userRole}</p>
            </div>
            <div className="py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-ink dark:text-on-dark hover:bg-shade-30/50 dark:hover:bg-white/5">
                <User className="w-4 h-4" />
                Profile
              </button>
              <Link
                href={`/${locale}/dashboard/settings`}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-ink dark:text-on-dark hover:bg-shade-30/50 dark:hover:bg-white/5"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
            <div className="border-t border-hairline-light dark:border-hairline-dark py-1">
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
