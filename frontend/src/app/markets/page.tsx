"use client"

import { useEffect, useState } from "react"
import { Building2, TrendingUp, TrendingDown, Minus, Clock, MapPin, Activity } from "lucide-react"

interface BourseItem {
  price: number;
  previous: number;
  status: 'up' | 'down' | 'stable';
}

interface BourseData {
  [key: string]: BourseItem;
}

const BourseCard = ({ title, value, color }: { title: string, value: number | undefined, color: string }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500 transition-colors">
    <div className={`absolute top-0 right-0 w-2 h-full ${color}`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className="text-slate-500 dark:text-slate-400 font-medium">
        {title}
      </div>
      <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:${color.replace('bg-', 'text-')}`}>
        <Building2 className="w-5 h-5" />
      </div>
    </div>
    <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
      {value ? value.toLocaleString() : "..."}
    </div>
    <div className="text-sm text-slate-500 mt-2">نقطة</div>
  </div>
)

export default function MarketsPage() {
  const [bourses, setBourses] = useState<BourseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchBourses = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      try {
        const res = await fetch("/api/bourses")
        const data = await res.json()
        if (data.success) {
          setBourses(data.data)
        }
      } catch (error) {
        console.error("Error fetching bourses:", error)
      }
    }

    fetchBourses(true)
    
    const interval = setInterval(() => fetchBourses(false), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Building2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">البورصات المحلية المباشرة</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">أسعار صرف 100 دولار في البورصات العراقية المركزية</p>
        </div>
        {bourses && (
          <div className="md:mr-auto mt-4 md:mt-0 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg font-mono" dir="ltr">
            Updated: {new Date(bourses.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <BourseCard title="بورصة الكفاح (بغداد)" value={bourses?.kifah?.price} color="bg-blue-500" />
        <BourseCard title="بورصة الحارثية (بغداد)" value={bourses?.harthiya?.price} color="bg-indigo-500" />
        <BourseCard title="بورصة أربيل (الشمال)" value={bourses?.erbil?.price} color="bg-emerald-500" />
        <BourseCard title="بورصة البصرة (الجنوب)" value={bourses?.basra?.price} color="bg-amber-500" />
      </div>
    </div>
  )
}
