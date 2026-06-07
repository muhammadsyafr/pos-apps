import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/pos-mobile-nav"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BrandLogo } from "@/components/brand-logo"
import { BRAND_NAME } from "@/lib/brand"

export default async function POSLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/${locale}/login`)
  const isAdmin = session.user.role === "ADMIN"
  const userRole = isAdmin ? "Store Manager" : "Cashier"

  return (
    <div className="min-h-screen bg-canvas-cream dark:bg-canvas-night text-ink dark:text-on-dark">
      <header className="sticky top-0 z-40 bg-canvas-light dark:bg-canvas-night border-b border-hairline-light dark:border-hairline-dark">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/pos`} className="flex items-center gap-3">
              <BrandLogo variant="app" size={36} />
              <span className="font-display font-[500] text-[18px] tracking-[0.72px] text-ink dark:text-on-dark hidden sm:block">
                {BRAND_NAME}
              </span>
            </Link>
            <Link href={`/${locale}/dashboard`} className="hidden lg:flex items-center px-4 py-2 text-shade-50 dark:text-shade-40 hover:bg-shade-30 dark:hover:bg-white/5 rounded-full font-[420] text-sm transition-all">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <ThemeToggle />
            <UserMenu userName={session.user?.name || "User"} userRole={userRole} />
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8">
        {children}
      </main>

      <MobileNav isAdmin={isAdmin} />

      <div className="lg:hidden h-20" />
    </div>
  )
}
