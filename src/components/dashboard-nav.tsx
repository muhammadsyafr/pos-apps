"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function DashboardNav() {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const locale = segments[1] || "en"
  
  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`
    if (href === "/dashboard") return pathname === fullHref
    return pathname.startsWith(fullHref)
  }

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/pos", label: "Sales" },
    { href: "/dashboard/inventory", label: "Inventory" },
    { href: "/dashboard/categories", label: "Categories" },
    { href: "/dashboard/reports", label: "Reports" },
    { href: "/dashboard/printer", label: "Printer" },
  ]

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={`/${locale}${item.href}`}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive(item.href)
              ? "text-blue-600 bg-blue-50"
              : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
