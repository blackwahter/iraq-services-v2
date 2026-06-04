"use client"

import { useEffect, useState } from "react"
import { Wallet, Search } from "lucide-react"

export default function SalariesPage() {
  const [updates, setUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch("/api/updates?category=رواتب")
        if (!res.ok) throw new Error("Network error")
        const data = await res.json()
        
        if (data.data && Array.isArray(data.data)) {
          setUpdates(data.data)
        } else if (Array.isArray(data)) {
          setUpdates(data.filter((u: any) => u.category === "رواتب"))
        }
      } catch (error) {
        console.error("Error fetching salaries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpdates()
    const interval = setInterval(fetchUpdates, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-md mx-auto w-full px-2 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">إشعارات الرواتب</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تحديثات الرواتب العاجلة لحظة بلحظة</p>
      </div>

      {/* Simplified Mobile Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="ابحث عن وزارة أو دائرة..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
        />
      </div>

      {/* Salary Feed */}
      <div className="space-y-4">
        {isLoading && updates.length === 0 ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : updates.length === 0 ? (
          <div className="text-center py-10 text-slate-500">لا توجد أخبار للرواتب حالياً</div>
        ) : (
          updates.map((update, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {update.content}
                </p>
                <div className="text-xs text-slate-400 mt-3 font-mono">
                  {new Date(update.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
