"use client"

import { useEffect, useState } from "react"
import { Building2, MapPin } from "lucide-react"

export default function MarketsPage() {
  const [bourses, setBourses] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBourses = async () => {
      try {
        const res = await fetch("/api/bourses")
        if (!res.ok) throw new Error("Network response was not ok")
        const data = await res.json()
        if (data.success) {
          setBourses(data.data)
        }
      } catch (error) {
        console.error("Error fetching bourses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBourses()
    const interval = setInterval(fetchBourses, 30000)
    return () => clearInterval(interval)
  }, [])

  const BourseCard = ({ title, value, color }: { title: string, value: number | undefined, color: string }) => (
    <div className={`rounded-3xl p-5 mb-4 shadow-sm border border-white/10 relative overflow-hidden bg-gradient-to-br ${color}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 className="w-24 h-24 text-white" /></div>
      <div className="relative z-10 flex justify-between items-center mb-6">
        <div className="text-white/90 font-bold text-lg">{title}</div>
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white">
          <MapPin className="w-5 h-5" />
        </div>
      </div>
      <div className="relative z-10 flex justify-end items-end gap-2">
        <span className="text-white/80 font-medium mb-1">دينار</span>
        <div className="text-4xl font-black text-white font-mono tracking-tighter">
          {value ? value.toLocaleString() : "..."}
        </div>
      </div>
    </div>
  )

  if (isLoading && !bourses) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="max-w-md mx-auto w-full px-2 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">الأسواق المحلية</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {bourses?.lastUpdated ? `آخر تحديث: ${new Date(bourses.lastUpdated).toLocaleTimeString('ar-IQ')}` : 'جاري التحديث...'}
        </p>
      </div>

      <div className="space-y-4">
        <BourseCard title="بورصة الكفاح (بغداد)" value={bourses?.kifah?.price} color="from-blue-600 to-indigo-800 shadow-blue-500/20" />
        <BourseCard title="بورصة الحارثية (بغداد)" value={bourses?.harthiya?.price} color="from-indigo-600 to-purple-800 shadow-indigo-500/20" />
        <BourseCard title="بورصة أربيل (الشمال)" value={bourses?.erbil?.price} color="from-emerald-500 to-teal-700 shadow-emerald-500/20" />
        <BourseCard title="بورصة البصرة (الجنوب)" value={bourses?.basra?.price} color="from-amber-500 to-orange-600 shadow-amber-500/20" />
      </div>
    </div>
  )
}
