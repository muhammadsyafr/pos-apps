"use client"

import { signOut } from "next-auth/react"
import { LogOut, User, Settings, ChevronDown } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

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
        className="flex items-center gap-2 pl-2 lg:pl-4 border-l border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg py-1 pr-2 transition-colors"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{userName}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{userRole}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {userName?.charAt(0).toUpperCase()}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userRole}</p>
          </div>
          <div className="py-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              <User className="w-4 h-4" />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 py-1">
            <button 
              onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
