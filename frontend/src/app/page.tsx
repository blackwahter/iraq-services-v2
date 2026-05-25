"use client"

import { useEffect, useState } from "react"
import { Building2, Coins, Droplet, TrendingUp, Newspaper, ArrowUpRight, ChevronLeft } from "lucide-react"
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
            setUpdates(updatesData.slice(0, 5))
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

  // 10-second Cycler for Bourses
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentBourseIndex((prev) => (prev + 1) % 4)
        setIsTransitioning(false)
      }, 500) // 500ms fade duration
    }, 10000) // 10 seconds

    return () => clearInterval(cycleInterval)
  }, [])

  const bourseList = [
    { name: "بورصة الكفاح (بغداد)", price: bourses?.kifah },
    { name: "بورصة الحارثية (بغداد)", price: bourses?.harthiya },
    { name: "بورصة أربيل (الشمال)", price: bourses?.erbil },
    { name: "بورصة البصرة (الجنوب)", price: bourses?.basra }
  ]

  const currentBourse = bourseList[currentBourseIndex]

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

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Main Bourse Cycler Card (Spans 2 columns on Desktop) */}
        <Link href="/markets" className="group md:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-10 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between min-h-[220px]">
          {/* Animated Background Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-1 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              بث حي <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          
          <div className="relative z-10 mt-auto">
            <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <p className="text-blue-100 font-medium text-lg md:text-xl mb-1 flex items-center gap-2">
                {currentBourse.name}
                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
              </p>
              <div className="flex items-end gap-3">
                <h2 className="text-5xl md:text-7xl font-black text-white font-mono tracking-tighter drop-shadow-md">
                  {currentBourse.price ? currentBourse.price.toLocaleString() : "---"}
                </h2>
                <span className="text-xl md:text-2xl text-blue-200 font-medium mb-2 md:mb-3">دينار</span>
              </div>
            </div>
            
            {/* Progress Bar for the 10s interval */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 rounded-full overflow-hidden mt-6">
              <div 
                key={currentBourseIndex} 
                className="h-full bg-white/40 animate-[slideRight_10s_linear]"
                style={{ animationName: 'slideRight', animationDuration: '10s', animationTimingFunction: 'linear' }}
              ></div>
            </div>
          </div>
        </Link>

        {/* Right Column: Oil & Gold */}
        <div className="flex flex-col gap-6">
          {/* Oil Prices Card */}
          <Link href="/oil" className="group bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-sm hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6" />
              </div>
              <ArrowUpRight className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-slate-400 font-bold text-lg">النفط العالمي</h3>
              <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                <span className="text-slate-300 font-medium">خام برنت</span>
                <span className="text-2xl font-black text-white font-mono">{oil?.brent ? `$${oil.brent.toFixed(2)}` : "---"}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-300 font-medium">الخام الأمريكي</span>
                <span className="text-xl font-bold text-slate-400 font-mono">{oil?.wti ? `$${oil.wti.toFixed(2)}` : "---"}</span>
              </div>
            </div>
          </Link>

          {/* Gold & Metals Placeholder */}
          <div className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all duration-300 flex-1 cursor-pointer">
            <div className="absolute inset-0 bg-amber-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-all">
                  <Coins className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg">قريباً</span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">المعادن والذهب</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  سيتم التفعيل فور ربط السيرفر بالأسعار المباشرة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest News Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Newspaper className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">شريط الأخبار المباشر</h2>
          </div>
          <Link href="/salaries" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
            عرض الكل <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex flex-col gap-3">
          {updates.length > 0 ? updates.map((update) => (
            <div key={update.id} className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-default border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <div className="flex items-center gap-3 md:w-48 shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{update.category}</span>
                <span className="text-xs text-slate-400 font-mono" dir="ltr">
                  {new Date(update.created_at).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {update.content}
              </p>
            </div>
          )) : (
            <div className="text-center py-8 text-slate-500 font-medium">جاري المراقبة وسحب الأخبار...</div>
          )}
        </div>
      </div>
    </div>
  )
}
