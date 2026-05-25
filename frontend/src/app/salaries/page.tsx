"use client"

import { useEffect, useState } from "react"
import { Search, Wallet } from "lucide-react"

export default function SalariesPage() {
  const [updates, setUpdates] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch("/api/updates")
        const data = await res.json()
        setUpdates(data.filter((u: any) => u.category === "رواتب"))
      } catch (error) {
        console.error("Error fetching salaries:", error)
      }
    }
    fetchUpdates()
    const interval = setInterval(fetchUpdates, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredUpdates = updates.filter(u => 
    u.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center md:text-right">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">نظام رصد وإطلاق الرواتب الحكومية</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">متابعة لحظية وحية لتمويل وصرف رواتب موظفي الدولة والمتقاعدين في العراق</p>
          </div>
        </div>

        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
            placeholder="ابحث عن وزارة، هيئة، أو محافظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUpdates.length > 0 ? filteredUpdates.map((update) => (
          <div key={update.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border-r-4 border-emerald-500 border-y border-l border-y-slate-200 border-l-slate-200 dark:border-y-slate-800 dark:border-l-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-md text-sm font-bold">
                خبر عاجل
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-sm" dir="ltr">
                {new Date(update.created_at).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'})} - {new Date(update.created_at).toLocaleDateString('ar-IQ')}
              </span>
            </div>
            <p className="text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {update.content}
            </p>
          </div>
        )) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            {updates.length === 0 ? "جاري جلب بيانات الرواتب..." : "لا توجد نتائج مطابقة للبحث"}
          </div>
        )}
      </div>
    </div>
  )
}
