"use client"

import { useEffect, useState } from "react"
import { Building2, Coins, Droplet, Wallet, Bell, Flame } from "lucide-react"

export default function Home() {
  const [bourses, setBourses] = useState<any>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [oil, setOil] = useState<any>(null)
  const [metals, setMetals] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Motion Cyclers State
  const [currentBourseIndex, setCurrentBourseIndex] = useState(0)
  const [currentOilIndex, setCurrentOilIndex] = useState(0)
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const safeFetch = async (url: string) => {
        try {
          const res = await fetch(url)
          if (!res.ok) return null
          return await res.json()
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

  // Bourse Cycler Effect
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setCurrentBourseIndex((prev) => (prev + 1) % 4)
    }, 5000) // Change every 5 seconds
    return () => clearInterval(cycleInterval)
  }, [])

  // Oil Cycler Effect
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setCurrentOilIndex((prev) => (prev + 1) % 2)
    }, 5000) // Change every 5 seconds
    return () => clearInterval(cycleInterval)
  }, [])

  const bourseList = [
    { id: "kifah", name: "الكفاح", price: bourses?.kifah?.price || 149500 },
    { id: "harthiya", name: "الحارثية", price: bourses?.harthiya?.price || 149500 },
    { id: "erbil", name: "أربيل", price: bourses?.erbil?.price || 149700 },
    { id: "basra", name: "البصرة", price: bourses?.basra?.price || 149400 }
  ]
  const currentBourse = bourseList[currentBourseIndex]

  const oilList = [
    { id: "brent", name: "خام برنت", price: oil?.brent || 80.0 },
    { id: "wti", name: "الخام الأمريكي", price: oil?.wti || 75.0 }
  ]
  const currentOil = oilList[currentOilIndex]

  const gold = metals?.gold?.price || 2350.0
  const salaries = updates.filter(u => u.category === "رواتب").slice(0, 3)

  if (isLoading && !bourses) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="space-y-5 max-w-md mx-auto w-full px-1">
      {/* Primary Animated Card: Bourses Cycler */}
      <a href="/markets" className="block relative overflow-hidden rounded-[32px] p-6 shadow-xl shadow-blue-500/20 border border-white/20 bg-gradient-to-br from-blue-600 to-indigo-800 transition-all duration-500">
        <div className="absolute -top-6 -right-6 p-4 opacity-10"><Building2 className="w-32 h-32" /></div>
        
        {/* Shimmer Sweep Effect for Motion */}
        <div key={`shimmer-${currentBourseIndex}`} className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmerSweep_5s_ease-in-out]"></div>

        <div className="relative z-10 flex justify-between items-center mb-8">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl text-white text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            LIVE
          </div>
          <div className="text-white/80 text-sm font-bold bg-black/20 px-3 py-1 rounded-xl transition-all duration-500" key={`city-${currentBourse.id}`}>
            {currentBourse.name}
          </div>
        </div>
        <div className="relative z-10 text-right">
          <div className="text-white/80 font-medium mb-1">سعر الدولار</div>
          <div className="flex items-end justify-end gap-2" key={`price-${currentBourse.id}`}>
            <span className="text-white/80 font-bold mb-2 transition-all duration-500">دينار</span>
            <span className="text-5xl font-black text-white font-mono tracking-tighter transition-all duration-500 animate-[fadeIn_0.5s_ease-out]">
              {currentBourse.price.toLocaleString()}
            </span>
          </div>
        </div>
      </a>

      {/* 2-Column Mobile Grid for Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gold Card */}
        <a href="/metals" className="block rounded-[28px] p-5 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] dark:opacity-10"><Coins className="w-24 h-24" /></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الذهب العالمي</span>
          </div>
          <div className="relative z-10 mt-auto text-right">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">${gold.toFixed(1)}</div>
            <div className="text-[10px] text-slate-400 font-bold">أونصة</div>
          </div>
        </a>

        {/* Oil Animated Card */}
        <a href="/oil" className="block rounded-[28px] p-5 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between h-36 transition-all duration-500">
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] dark:opacity-10"><Droplet className="w-24 h-24" /></div>
          <div className="flex items-center gap-2 relative z-10" key={`oilname-${currentOil.id}`}>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-[fadeIn_0.5s_ease-out]">{currentOil.name}</span>
          </div>
          <div className="relative z-10 mt-auto text-right" key={`oilprice-${currentOil.id}`}>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono animate-[fadeIn_0.5s_ease-out]">${currentOil.price.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400 font-bold">برميل</div>
          </div>
        </a>
      </div>

      {/* Modern iOS-Style Notification Stack */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            عاجل الرواتب
          </h2>
          <a href="/salaries" className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">عرض الكل</a>
        </div>
        
        <div className="space-y-3">
          {salaries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 text-center border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 text-sm">لا توجد تحديثات حالياً</p>
            </div>
          ) : (
            salaries.map((s, idx) => (
              <a href="/salaries" key={idx} className="block bg-white dark:bg-slate-900 rounded-[24px] p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-center active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-tight line-clamp-2">
                    {s.content}
                  </p>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
