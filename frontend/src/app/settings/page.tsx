"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun, Bell, Banknote, Coins, Droplet, ChevronLeft, Info } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    setMounted(true)
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted")
    }
  }, [])

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      alert("الإشعارات مفعلة مسبقاً! يمكنك إدارتها من إعدادات المتصفح أو الهاتف.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
    if (permission === "granted") {
      new Notification("بوابة العراق المالية", { body: "تم تفعيل الإشعارات بنجاح!" });
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div className="max-w-md mx-auto w-full px-2 pb-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">الإعدادات والمزيد</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تخصيص التطبيق والوصول للأقسام</p>
      </div>

      {/* Preferences Section */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 px-2">التفضيلات الأساسية</h2>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Dark Mode Toggle */}
          <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">الوضع الليلي</span>
            </div>
            <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${isDark ? 'left-1 translate-x-5' : 'left-1'}`}></div>
            </div>
          </button>

          {/* Notifications Toggle */}
          <button onClick={requestNotifications} className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notificationsEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800 dark:text-slate-200">إشعارات عاجلة</div>
                <div className="text-[10px] text-slate-500">تنبيه عند صدور رواتب جديدة</div>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${notificationsEnabled ? 'left-1 translate-x-5' : 'left-1'}`}></div>
            </div>
          </button>
        </div>
      </div>

      {/* Sections from Old Website */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 px-2">شاشات التطبيق الإضافية</h2>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          <a href="/currencies" className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Banknote className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">العملات الأجنبية</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </a>

          <a href="/metals" className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
                <Coins className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">الذهب والفضة</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </a>

          <a href="/oil" className="flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <Droplet className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">أسعار النفط</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </a>

        </div>
      </div>

      {/* App Info */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 text-slate-400 dark:text-slate-500">
        <Info className="w-6 h-6 mb-2 opacity-50" />
        <p className="font-bold text-sm">بوابة العراق المالية (IQD)</p>
        <p className="text-xs mt-1 font-mono">V 2.0.0 (Native PWA)</p>
      </div>

    </div>
  )
}
