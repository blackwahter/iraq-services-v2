"use client"

import { useEffect, useState } from "react"
import { Building2, Coins, Droplet, TrendingUp, Wallet, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface BourseData {
  kifah: number;
  harthiya: number;
  erbil: number;
  basra: number;
  lastUpdated: string;
}

interface OilData {
  brent: number;
  wti: number;
}

export default function Home() {
  const [bourses, setBourses] = useState<BourseData | null>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [oil, setOil] = useState<OilData | null>(null)

  // Bourse Cycler State
  const [currentBourseIndex, setCurrentBourseIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Oil Cycler State
  const [currentOilIndex, setCurrentOilIndex] = useState(0)
  const [isOilTransitioning, setIsOilTransitioning] = useState(false)

  // Data Fetcher
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boursesRes, updatesRes, oilRes] = await Promise.all([
          fetch("/api/bourses").catch(() => null),
          fetch("/api/updates").catch(() => null),
          fetch("/api/oil").catch(() => null)
        ])
        
        if (boursesRes) {
          const boursesData = await boursesRes.json()
          if (boursesData.success) setBourses(boursesData.data)
        }

        if (updatesRes) {
          const updatesData = await updatesRes.json()
          if (Array.isArray(updatesData)) {
            setUpdates(updatesData)
          }
        }

        if (oilRes) {
          const oilData = await oilRes.json()
          if (oilData.success) setOil({ brent: oilData.brent, wti: oilData.wti })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  // 5-second Cycler for Bourses
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentBourseIndex((prev) => (prev + 1) % 4)
        setIsTransitioning(false)
      }, 500) // 500ms fade duration
    }, 5000) // 5 seconds

    return () => clearInterval(cycleInterval)
  }, [])

  // 5-second Cycler for Oil
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setIsOilTransitioning(true)
      setTimeout(() => {
        setCurrentOilIndex((prev) => (prev + 1) % 2)
        setIsOilTransitioning(false)
      }, 500) // 500ms fade duration
    }, 5000) // 5 seconds

    return () => clearInterval(cycleInterval)
  }, [])

  const bourseList = [
    { name: "الكفاح", price: bourses?.kifah, color: "from-blue-600/80 to-indigo-700/80", shadow: "shadow-blue-500/20" },
    { name: "الحارثية", price: bourses?.harthiya, color: "from-emerald-600/80 to-teal-700/80", shadow: "shadow-emerald-500/20" },
    { name: "أربيل", price: bourses?.erbil, color: "from-amber-500/80 to-orange-600/80", shadow: "shadow-amber-500/20" },
    { name: "البصرة", price: bourses?.basra, color: "from-purple-600/80 to-pink-700/80", shadow: "shadow-purple-500/20" }
  ]

  const currentBourse = bourseList[currentBourseIndex]

  const oilList = [
    { name: "خام برنت", price: oil?.brent ? `$${oil.brent.toFixed(2)}` : "---", color: "from-slate-700/80 to-gray-900/80", shadow: "shadow-slate-500/20" },
    { name: "الخام الأمريكي", price: oil?.wti ? `$${oil.wti.toFixed(2)}` : "---", color: "from-cyan-700/80 to-blue-900/80", shadow: "shadow-cyan-500/20" }
  ]
  const currentOil = oilList[currentOilIndex]

  const salaryUpdates = updates.filter(u => u.category === "رواتب").slice(0, 3)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            لوحة التحكم الذكية
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            مراقبة حية لجميع الأسواق والأخبار العراقية
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800/30">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-sm">متصل ومحدث</span>
        </div>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Bourse Cycler Card */}
        <Link href="/markets" className={`group relative overflow-hidden rounded-3xl p-6 shadow-xl hover:${currentBourse.shadow} transition-all duration-700 hover:scale-[1.02] flex flex-col justify-between min-h-[200px] border border-white/20 dark:border-white/10 backdrop-blur-xl bg-gradient-to-br ${currentBourse.color}`}>
          
          {/* Classy Shimmer Loading Effect (5s) */}
          <div key={`shimmer-${currentBourseIndex}`} className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmerSweep_5s_ease-in-out]"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              بث حي <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          
          <div className="relative z-10 mt-auto">
            <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <p className="text-white/80 font-medium text-lg mb-1 flex items-center gap-2">
                بورصة {currentBourse.name}
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              </p>
              <div className="flex items-end gap-3">
                <h2 className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-lg">
                  {currentBourse.price ? currentBourse.price.toLocaleString() : "---"}
                </h2>
                <span className="text-xl text-white/80 font-medium mb-2">دينار</span>
              </div>
            </div>
          </div>
        </Link>

        {/* 2. Gold & Metals Card (Same size as Bourses) */}
        <div className="group relative overflow-hidden rounded-3xl p-6 shadow-xl hover:shadow-amber-500/20 transition-all duration-500 hover:scale-[1.02] flex flex-col justify-between min-h-[200px] border border-white/20 dark:border-white/10 backdrop-blur-xl bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 cursor-pointer">
          
          {/* Classy Shimmer Loading Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-[shimmerSweep_5s_ease-in-out_infinite]"></div>

          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="bg-amber-500/20 backdrop-blur-md p-3 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
              <Coins className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg">قريباً</span>
          </div>
          
          <div className="relative z-10 mt-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">المعادن والذهب</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              سيتم التفعيل فور ربط السيرفر بالأسعار المباشرة.
            </p>
          </div>
        </div>

        {/* 3. Urgent Salaries Mini Card */}
        <Link href="/salaries" className="group relative overflow-hidden rounded-3xl p-6 shadow-xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-[1.02] flex flex-col min-h-[200px] border border-white/20 dark:border-white/10 backdrop-blur-xl bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-slate-800/80 dark:to-slate-900/80">
          
          {/* Classy Shimmer Loading Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-[shimmerSweep_5s_ease-in-out_infinite]"></div>

          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 backdrop-blur-md p-3 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">إشعارات الرواتب</h3>
            </div>
            <ArrowUpRight className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          
          <div className="relative z-10 flex flex-col gap-2 flex-1">
            {salaryUpdates.length > 0 ? salaryUpdates.map((update, idx) => (
              <div key={update.id} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-white/50 dark:border-white/5">
                <p className="text-slate-700 dark:text-slate-200 text-sm font-medium line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {update.content}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono" dir="ltr">
                  {new Date(update.created_at).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">
                جاري المراقبة وسحب أحدث الرواتب...
              </div>
            )}
          </div>
        </Link>

        {/* 4. Oil Prices Card */}
        <Link href="/oil" className={`group relative overflow-hidden rounded-3xl p-6 shadow-xl hover:${currentOil.shadow} transition-all duration-700 hover:scale-[1.02] flex flex-col justify-between min-h-[200px] border border-white/20 dark:border-white/10 backdrop-blur-xl bg-gradient-to-br ${currentOil.color}`}>
          
          {/* Classy Shimmer Loading Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmerSweep_5s_ease-in-out_infinite]"></div>

          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
              <Droplet className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-white/50 group-hover:text-white transition-colors" />
          </div>
          
          <div className="relative z-10 mt-auto">
            <h3 className="text-white font-bold text-lg mb-4">النفط العالمي</h3>
            <div className={`transition-all duration-500 transform ${isOilTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <p className="text-white/80 font-medium text-lg mb-1 flex items-center gap-2">
                {currentOil.name}
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              </p>
              <div className="flex items-end gap-3">
                <h2 className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-lg">
                  {currentOil.price}
                </h2>
              </div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}
