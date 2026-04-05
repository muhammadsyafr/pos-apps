import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/mobile-nav"
import LanguageSwitcher from "@/components/language-switcher"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  if (!session) redirect(`/${locale}/login`)

  const isAdmin = session.user?.role === "ADMIN"
  const isCashier = session.user?.role === "CASHIER"

  if (isCashier) redirect(`/${locale}/pos`)
  if (!isAdmin) redirect(`/${locale}/pos`)

  const userRole = session.user?.role === "ADMIN" ? "Store Manager" : "Cashier"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white signature-gradient">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight font-headline text-blue-800 dark:text-blue-400 hidden sm:block">CloudPOS</span>
            </Link>

            <DashboardNav />
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            
            <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
            </button>

            <UserMenu userName={session.user?.name || "User"} userRole={userRole} />
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <MobileNav />

      <div className="lg:hidden h-20" />
    </div>
  )
}
