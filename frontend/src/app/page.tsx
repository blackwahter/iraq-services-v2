"use client"

import { useEffect, useState } from "react"
import { Building2, Coins, Droplet, Wallet, ArrowUpRight, ArrowDownRight, Minus, Bell } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [bourses, setBourses] = useState<any>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [oil, setOil] = useState<any>(null)
  const [metals, setMetals] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Safe fetcher
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      const safeFetch = async (url: string) => {
        try {
          const res = await fetch(url)
          if (!res.ok) return null
          const data = await res.json()
          return data
        } catch {
          return null
        }
      }

      const [bData, uData, oData, mData] = await Promise.all([
        safeFetch("/api/bourses"),
        safeFetch("/api/updates"),
        safeFetch("/api/oil"),
        safeFetch("/api/metals")
      ])

      if (bData?.success) setBourses(bData.data)
      if (Array.isArray(uData)) setUpdates(uData)
      else if (uData?.data && Array.isArray(uData.data)) setUpdates(uData.data)
      if (oData?.success) setOil({ brent: oData.brent, wti: oData.wti })
      if (mData?.success) setMetals({ gold: mData.gold, silver: mData.silver })
      
      setIsLoading(false)
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const kifah = bourses?.kifah?.price || 149500
  const gold = metals?.gold?.price || 2350.0
  const brent = oil?.brent || 80.0
  const salaries = updates.filter(u => u.category === "رواتب").slice(0, 2)

  if (isLoading && !bourses) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="space-y-4 max-w-md mx-auto w-full px-2">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">أهلاً بك ☀️</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تحديثات الأسواق مباشرة الآن</p>
      </div>

      {/* Primary Card: Kifah Bourse */}
      <Link href="/markets" className="block relative overflow-hidden rounded-3xl p-5 shadow-lg shadow-blue-500/20 border border-white/10 bg-gradient-to-br from-blue-600 to-indigo-800">
        <div className="absolute top-0 right-0 p-4 opacity-20"><Building2 className="w-24 h-24" /></div>
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            بث حي
          </div>
        </div>
        <div className="relative z-10 text-right">
          <div className="text-white/80 font-medium mb-1">بورصة الكفاح (بغداد)</div>
          <div className="flex items-end justify-end gap-2">
            <span className="text-white/80 font-bold mb-1">دينار</span>
            <span className="text-4xl font-black text-white font-mono tracking-tighter">
              {kifah.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>

      {/* Horizontal Scroll for Secondary Assets */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
        {/* Gold Card */}
        <div className="min-w-[160px] snap-center rounded-3xl p-4 bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-20"><Coins className="w-20 h-20" /></div>
          <div className="relative z-10">
            <div className="text-white/80 text-xs font-medium mb-4">الذهب العالمي</div>
            <div className="text-2xl font-black font-mono">${gold.toFixed(1)}</div>
            <div className="text-white/70 text-[10px] mt-1">أونصة</div>
          </div>
        </div>

        {/* Oil Card */}
        <div className="min-w-[160px] snap-center rounded-3xl p-4 bg-gradient-to-br from-slate-800 to-slate-950 shadow-lg shadow-slate-500/20 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-20"><Droplet className="w-20 h-20" /></div>
          <div className="relative z-10">
            <div className="text-white/80 text-xs font-medium mb-4">خام برنت</div>
            <div className="text-2xl font-black font-mono">${brent.toFixed(2)}</div>
            <div className="text-white/70 text-[10px] mt-1">برميل</div>
          </div>
        </div>
      </div>

      {/* Salaries Notifications Stack */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white">إشعارات الرواتب</h2>
          </div>
          <Link href="/salaries" className="text-xs text-blue-600 dark:text-blue-400 font-bold">الكل</Link>
        </div>
        
        <div className="space-y-3">
          {salaries.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">لا توجد تحديثات حالياً</p>
          ) : (
            salaries.map((s, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {s.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
