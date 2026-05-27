"use client"

import { useEffect, useState } from "react"
import { Droplet, ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useSettings } from "@/components/settings-provider"

interface OilData {
  brent: number;
  wti: number;
}

export default function OilPage() {
  const [oilData, setOilData] = useState<{ brent: number, wti: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    const fetchOil = async (showLoading = false) => {
      if (showLoading) setLoading(true)
      try {
        const res = await fetch("/api/oil")
        const data = await res.json()
        if (data.success) {
          setOilData({ brent: data.brent, wti: data.wti })
        }
      } catch (error) {
        console.error("Error fetching oil:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOil(true)
    const interval = setInterval(() => fetchOil(false), settings.refreshRate)
    return () => clearInterval(interval)
  }, [settings.refreshRate])

  const OilCard = ({ title, price, type }: { title: string, price: number | undefined, type: string }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between h-48 group hover:border-slate-400 dark:hover:border-slate-600 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
          <p className="text-slate-500 font-medium">{type}</p>
        </div>
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300">
          <Droplet className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-1">
          <span className="text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
            {price ? price.toFixed(2) : "---"}
          </span>
          <span className="text-lg font-bold text-slate-500 mb-1">$</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg text-sm">
          <ArrowUpRight className="w-4 h-4" />
          مباشر
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center md:text-right max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">أسعار النفط العالمي</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          يعتمد الاقتصاد العراقي بنسبة تفوق 90% على الإيرادات النفطية. يتم تقييم الصادرات البحرية عبر موانئ البصرة بأسعار نسبية لبرنت العالمي.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OilCard title="خام برنت" type="Brent Crude Oil" price={oilData?.brent} />
        <OilCard title="الخام الأمريكي" type="WTI Crude Oil" price={oilData?.wti} />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h4 className="text-blue-900 dark:text-blue-300 font-bold text-lg mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          الأثر المالي لصادرات الطاقة
        </h4>
        <p className="text-blue-800 dark:text-blue-400 leading-relaxed font-medium">
          صعود أسعار برميل النفط يعزز متانة الاحتياطي النقدي للبنك المركزي العراقي ويدعم استقرار سعر الصرف.
        </p>
      </div>
    </div>
  )
}
