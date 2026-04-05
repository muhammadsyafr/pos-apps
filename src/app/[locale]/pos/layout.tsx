import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { MobileNav } from "@/components/pos-mobile-nav"
import LanguageSwitcher from "@/components/language-switcher"
import { ThemeToggle } from "@/components/ui/theme-toggle"

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
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/pos`} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white signature-gradient">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight font-headline text-blue-800 dark:text-blue-400 hidden sm:block">CloudPOS</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            
            {isAdmin && (
              <Link href={`/${locale}/dashboard`} className="hidden lg:flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl font-medium text-sm transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                Dashboard
              </Link>
            )}

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
