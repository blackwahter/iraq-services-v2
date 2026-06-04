"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, Building2, Calculator, Settings } from "lucide-react"

const navItems = [
  { name: "الرئيسية", href: "/", icon: LayoutDashboard },
  { name: "المحول", href: "/converter", icon: Calculator },
  { name: "الرواتب", href: "/salaries", icon: Wallet },
  { name: "الأسواق", href: "/markets", icon: Building2 },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-white/90 via-white/80 to-transparent dark:from-slate-950/90 dark:via-slate-950/80 dark:to-transparent backdrop-blur-xl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 shadow-2xl rounded-3xl p-2 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${
                isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-2xl"></div>
              )}
              
              <Icon className={`w-6 h-6 relative z-10 transition-transform duration-300 ${isActive ? "scale-110 mb-1" : "scale-100"}`} />
              
              {isActive && (
                <span className="text-[10px] font-bold relative z-10">{item.name}</span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
