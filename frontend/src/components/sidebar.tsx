"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, Banknote, Coins, Droplet, Building2, Calculator, Settings } from "lucide-react"

const navItems = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "أخبار الرواتب", href: "/salaries", icon: Wallet },
  { name: "العملات الأجنبية", href: "/currencies", icon: Banknote },
  { name: "الذهب والفضة", href: "/metals", icon: Coins },
  { name: "أسعار النفط", href: "/oil", icon: Droplet },
  { name: "البورصات المحلية", href: "/markets", icon: Building2 },
  { name: "المحول المالي", href: "/converter", icon: Calculator },
  { name: "الإعدادات", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full hidden md:flex">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">IQD</div>
          بوابة العراق المالية
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-500 dark:text-slate-400">
        الإصدار 2.0.0
      </div>
    </aside>
  )
}
