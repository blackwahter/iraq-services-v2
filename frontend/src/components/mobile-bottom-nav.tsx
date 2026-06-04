"use client"

import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, Building2, Calculator, Settings, Banknote, Coins, Droplet } from "lucide-react"

const navItems = [
  { name: "الرئيسية", href: "/", icon: LayoutDashboard },
  { name: "المحول", href: "/converter", icon: Calculator },
  { name: "الذهب", href: "/metals", icon: Coins },
  { name: "العملات", href: "/currencies", icon: Banknote },
  { name: "النفط", href: "/oil", icon: Droplet },
  { name: "الأسواق", href: "/markets", icon: Building2 },
  { name: "الرواتب", href: "/salaries", icon: Wallet },
  { name: "الإعدادات", href: "/settings", icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white/95 via-white/90 to-transparent dark:from-slate-950/95 dark:via-slate-950/90 dark:to-transparent backdrop-blur-xl">
      <div className="px-2 pb-6 pt-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xl rounded-3xl p-1.5 flex overflow-x-auto gap-2 hide-scrollbar snap-x snap-mandatory">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");
            const Icon = item.icon
            return (
              <a
                key={item.name}
                href={item.href}
                className={`snap-center shrink-0 relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
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
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
