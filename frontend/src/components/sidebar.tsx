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
    <aside className="w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-l border-slate-200/50 dark:border-white/10 flex flex-col h-full hidden md:flex shadow-2xl relative overflow-hidden">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-blue-500/10 blur-3xl -z-10 pointer-events-none"></div>

      <div className="p-6 border-b border-slate-200/50 dark:border-white/5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/30">
            IQD
          </div>
          <span className="tracking-tight">بوابة العراق</span>
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar relative z-10">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium overflow-hidden ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-500/20"
                      : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
                  }`}
                >
                  {/* Active Background Glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] animate-[shimmerSweep_3s_ease-in-out_infinite]"></div>
                  )}

                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 dark:bg-blue-500 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  )}

                  <Icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? "scale-110 drop-shadow-md" : "group-hover:scale-110 group-hover:rotate-3"
                  }`} />
                  
                  <span className={`transition-transform duration-300 ${!isActive && "group-hover:-translate-x-1"}`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-slate-200/50 dark:border-white/5 relative z-10">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 text-center transition-all hover:shadow-md">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            الإصدار 2.0.0
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 py-1 px-2 rounded-full w-max mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            النظام مستقر
          </div>
        </div>
      </div>
    </aside>
  )
}
