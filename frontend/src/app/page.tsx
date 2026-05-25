"use client"

import { useEffect, useState } from "react"
import { Building2, Coins, Droplet, Wallet } from "lucide-react"

interface BourseData {
  kifah: number;
  harthiya: number;
  erbil: number;
  basra: number;
  lastUpdated: string;
}

export default function Home() {
  const [bourses, setBourses] = useState<BourseData | null>(null)
  const [updates, setUpdates] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boursesRes, updatesRes] = await Promise.all([
          fetch("/api/bourses"),
          fetch("/api/updates")
        ])
        
        const boursesData = await boursesRes.json()
        if (boursesData.success) {
          setBourses(boursesData.data)
        }

        const updatesData = await updatesRes.json()
        if (Array.isArray(updatesData)) {
          setUpdates(updatesData.slice(0, 5))
        } else {
          setUpdates([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">لوحة التحكم والمراقبة</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">نظرة عامة على الأسواق المالية والرواتب</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Statistics Cards */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">بورصة الكفاح</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {bourses ? bourses.kifah.toLocaleString("en-US") : "---"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">أخبار الرواتب</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {updates.filter(u => u.category === "رواتب").length} <span className="text-sm font-normal">جديد</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">تحديثات الذهب</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                مفعل
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Droplet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">النفط العالمي</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                نشط
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">أحدث الأخبار العاجلة</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {updates.length > 0 ? updates.map((update) => (
              <div key={update.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    update.category === 'رواتب' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    update.category === 'ذهب' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    update.category === 'عملات' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {update.category}
                  </span>
                  <span className="text-sm text-slate-500 font-mono" dir="ltr">
                    {new Date(update.created_at).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {update.content}
                </p>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">مؤشر البورصات المحلية المباشر</h2>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {bourses ? (
                <>
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <span className="font-bold text-slate-700 dark:text-slate-300">بورصة الكفاح (بغداد)</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{bourses.kifah.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <span className="font-bold text-slate-700 dark:text-slate-300">بورصة الحارثية (بغداد)</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{bourses.harthiya.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <span className="font-bold text-slate-700 dark:text-slate-300">بورصة أربيل (الشمال)</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{bourses.erbil.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <span className="font-bold text-slate-700 dark:text-slate-300">بورصة البصرة (الجنوب)</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{bourses.basra.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-slate-500">جاري جلب الأسعار المباشرة...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
