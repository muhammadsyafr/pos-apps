import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { NotificationBell } from "@/components/notification-bell"

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
            <ThemeToggle />
            <NotificationBell />
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
