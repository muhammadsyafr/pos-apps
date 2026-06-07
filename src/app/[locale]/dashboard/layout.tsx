import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { BrandLogo } from "@/components/brand-logo"
import { BRAND_NAME } from "@/lib/brand"

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
    <div className="min-h-screen bg-canvas-cream dark:bg-canvas-night text-ink dark:text-on-dark overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-canvas-light dark:bg-canvas-night border-b border-hairline-light dark:border-hairline-dark">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
              <BrandLogo variant="app" size={36} />
              <span className="font-display font-[500] text-[18px] tracking-[0.72px] text-ink dark:text-on-dark hidden sm:block">
                {BRAND_NAME}
              </span>
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
