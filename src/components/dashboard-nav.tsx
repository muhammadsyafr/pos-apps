"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

export function DashboardNav() {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const locale = segments[1] || "en"
  const { data: session } = useSession()
  
  const isCashier = session?.user?.role === "CASHIER"
  
  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`
    if (href === "/dashboard") return pathname === fullHref
    return pathname.startsWith(fullHref)
  }

  const allNavItems = [
    { href: "/dashboard", label: "Overview", roles: ["ADMIN", "CASHIER"] },
    { href: "/pos", label: "Sales", roles: ["ADMIN", "CASHIER"] },
    { href: "/dashboard/inventory", label: "Inventory", roles: ["ADMIN"] },
    { href: "/dashboard/categories", label: "Categories", roles: ["ADMIN"] },
    { href: "/dashboard/reports", label: "Reports", roles: ["ADMIN", "CASHIER"] },
  ]

  const navItems = allNavItems.filter(item => 
    item.roles.includes(session?.user?.role || "CASHIER")
  )

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={`/${locale}${item.href}`}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive(item.href)
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
              : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
