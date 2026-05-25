"use client"

import { useEffect, useState } from "react"
import { Building2, Coins, Droplet, Wallet, ArrowUpRight, TrendingUp, ChevronLeft, Newspaper } from "lucide-react"
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

  const latestSalaryNews = updates.find(u => u.category === "رواتب")

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
        
        {/* Main Dollar Card (Spans 2 columns on Desktop) */}
        <Link href="/markets" className="group block md:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-1 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                بث حي <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-blue-100 font-medium text-lg mb-1">بورصة الكفاح (بغداد)</p>
              <div className="flex items-end gap-3">
                <h2 className="text-6xl md:text-7xl font-black text-white font-mono tracking-tighter">
                  {bourses ? bourses.kifah.toLocaleString() : "---"}
                </h2>
                <span className="text-xl text-blue-200 font-medium mb-2">دينار</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Latest Salary News Card */}
        <Link href="/salaries" className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          
          <div>
            <h3 className="text-slate-500 font-bold mb-2">عاجل الرواتب</h3>
            <p className="text-lg font-bold text-slate-900 dark:text-white line-clamp-3 leading-snug">
              {latestSalaryNews ? latestSalaryNews.content : "لا توجد أخبار رواتب جديدة حالياً. جاري المراقبة..."}
            </p>
          </div>
        </Link>

        {/* Oil Prices Card */}
        <Link href="/oil" className="group bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-sm hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Droplet className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-slate-400 font-bold">النفط العالمي</h3>
            <div className="flex justify-between items-end border-b border-slate-800 pb-3">
              <span className="text-slate-300">خام برنت</span>
              <span className="text-2xl font-black text-white font-mono">{oil?.brent ? `$${oil.brent.toFixed(2)}` : "---"}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-slate-300">الخام الأمريكي</span>
              <span className="text-xl font-bold text-slate-400 font-mono">{oil?.wti ? `$${oil.wti.toFixed(2)}` : "---"}</span>
            </div>
          </div>
        </Link>

        {/* Other Local Bourses */}
        <Link href="/markets" className="group md:col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">المحافظات</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { name: "أربيل", price: bourses?.erbil },
              { name: "البصرة", price: bourses?.basra },
              { name: "الحارثية", price: bourses?.harthiya }
            ].map((b, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="font-medium text-slate-600 dark:text-slate-400">{b.name}</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{b.price?.toLocaleString() || "---"}</span>
              </div>
            ))}
          </div>
        </Link>

        {/* Gold & Metals Placeholder */}
        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all duration-300 cursor-pointer">
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
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                سيتم تفعيل الأسعار المباشرة للذهب فور ربطها بالسيرفر. التصميم جاهز بانتظارك!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Latest News Feed Mini */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Newspaper className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">شريط الأخبار المباشر</h2>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          {updates.length > 0 ? updates.map((update) => (
            <div key={update.id} className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-default border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <div className="flex items-center gap-3 md:w-48 shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
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
            <div className="text-center py-8 text-slate-500">جاري سحب الأخبار...</div>
          )}
        </div>
      </div>
    </div>
  )
}
