"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Bell, Menu } from "lucide-react"
import { useEffect, useState } from "react"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState("")

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Brand Name for Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg">IQD</div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[80px] text-center" suppressHydrationWarning>
            {mounted ? time : "00:00:00"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="تبديل المظهر"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
      </div>
    </header>
  )
}
