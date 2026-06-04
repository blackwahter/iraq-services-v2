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

  const getBourseColor = (id: string) => {
    switch(id) {
      case 'kifah': return 'from-blue-600 to-indigo-800 shadow-blue-500/30';
      case 'harthiya': return 'from-indigo-600 to-purple-800 shadow-indigo-500/30';
      case 'erbil': return 'from-emerald-600 to-teal-800 shadow-emerald-500/30';
      case 'basra': return 'from-cyan-600 to-blue-800 shadow-cyan-500/30';
      default: return 'from-blue-600 to-indigo-800 shadow-blue-500/30';
    }
  }

  return (
    <div className="space-y-5 max-w-md mx-auto w-full px-1">
      {/* Primary Animated Card: Bourses Cycler */}
      <a href="/markets" className={`block relative overflow-hidden rounded-[32px] p-6 shadow-xl border border-white/20 bg-gradient-to-br ${getBourseColor(currentBourse.id)} transition-colors duration-700`}>
        <div className="absolute -top-6 -right-6 p-4 opacity-10"><Building2 className="w-32 h-32 text-white" /></div>
        
        {/* Shimmer Sweep Effect for Motion */}
        <div key={`shimmer-${currentBourseIndex}`} className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmerSweep_5s_ease-in-out]"></div>

        <div className="relative z-10 flex justify-between items-center mb-8">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl text-white text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            LIVE
          </div>
          <div className="text-white/90 text-sm font-bold bg-black/20 px-3 py-1 rounded-xl transition-all duration-500 shadow-inner" key={`city-${currentBourse.id}`}>
            {currentBourse.name}
          </div>
        </div>
        <div className="relative z-10 text-right">
          <div className="text-white/80 font-medium mb-1">سعر الدولار</div>
          <div className="flex items-end justify-end gap-2" key={`price-${currentBourse.id}`}>
            <span className="text-white/80 font-bold mb-2 transition-all duration-500">دينار</span>
            <span className="text-5xl font-black text-white font-mono tracking-tighter transition-all duration-500 animate-[fadeIn_0.5s_ease-out] drop-shadow-md">
              {currentBourse.price.toLocaleString()}
            </span>
          </div>
        </div>
      </a>

      {/* 2-Column Mobile Grid for Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gold Card */}
        <a href="/metals" className="block rounded-[28px] p-5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 shadow-sm border border-amber-200/50 dark:border-amber-800/30 relative overflow-hidden flex flex-col justify-between h-36 transition-all duration-500 hover:shadow-md">
          <div className="absolute -right-2 -bottom-2 opacity-[0.04] dark:opacity-10"><Coins className="w-24 h-24 text-amber-600" /></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shadow-inner">
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-900 dark:text-amber-500">الذهب العالمي</span>
          </div>
          <div className="relative z-10 mt-auto text-right">
            <div className="text-2xl font-black text-amber-950 dark:text-amber-400 font-mono drop-shadow-sm">${gold.toFixed(1)}</div>
            <div className="text-[10px] text-amber-700/70 dark:text-amber-500/70 font-bold">أونصة</div>
          </div>
        </a>

        {/* Oil Animated Card */}
        <a href="/oil" className={`block rounded-[28px] p-5 bg-gradient-to-br ${currentOil.id === 'brent' ? 'from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black text-white border-slate-700' : 'from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/10 text-slate-900 dark:text-white border-rose-200/50 dark:border-rose-900/30'} shadow-sm border relative overflow-hidden flex flex-col justify-between h-36 transition-colors duration-700`}>
          <div className="absolute -right-2 -bottom-2 opacity-[0.04] dark:opacity-10"><Droplet className="w-24 h-24" /></div>
          <div className="flex items-center gap-2 relative z-10" key={`oilname-${currentOil.id}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${currentOil.id === 'brent' ? 'bg-slate-700' : 'bg-rose-100 dark:bg-rose-900/40'}`}>
              <Droplet className={`w-4 h-4 ${currentOil.id === 'brent' ? 'text-slate-300' : 'text-rose-600 dark:text-rose-400'}`} />
            </div>
            <span className={`text-xs font-bold animate-[fadeIn_0.5s_ease-out] ${currentOil.id === 'brent' ? 'text-slate-300' : 'text-rose-900 dark:text-rose-500'}`}>{currentOil.name}</span>
          </div>
          <div className="relative z-10 mt-auto text-right" key={`oilprice-${currentOil.id}`}>
            <div className="text-2xl font-black font-mono animate-[fadeIn_0.5s_ease-out] drop-shadow-sm">${currentOil.price.toFixed(2)}</div>
            <div className={`text-[10px] font-bold ${currentOil.id === 'brent' ? 'text-slate-400' : 'text-rose-700/70 dark:text-rose-500/70'}`}>برميل</div>
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
