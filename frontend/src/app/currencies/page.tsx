"use client"

import { useEffect, useState } from "react"
import { DollarSign, ArrowUpRight, ArrowDownRight, Minus, Activity } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

interface BourseItem {
  price: number;
  previous: number;
  status: 'up' | 'down' | 'stable';
}

interface BourseData {
  kifah: BourseItem;
  lastUpdated: string;
}

export default function CurrenciesPage() {
  const [bourses, setBourses] = useState<BourseData | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBourses = async () => {
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

    const fetchChartData = async () => {
      try {
        const res = await fetch("/api/dollar-chart")
        const data = await res.json()
        if (data.success) {
          // Format date for chart
          const formattedData = data.data.map((item: any) => ({
            ...item,
            timeLabel: new Date(item.time).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
            price: item.price
          }))
          setChartData(formattedData)
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBourses()
    fetchChartData()
    
    const interval = setInterval(() => {
        fetchBourses();
        fetchChartData();
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const currentDollar = bourses?.kifah

  // Determine styles based on status
  let statusColor = "text-yellow-500"
  let bgColor = "bg-yellow-50 dark:bg-yellow-900/20"
  let borderColor = "border-yellow-200 dark:border-yellow-900/50"
  let StatusIcon = Minus
  let statusText = "استقرار"

  if (currentDollar?.status === "up") {
    statusColor = "text-emerald-500"
    bgColor = "bg-emerald-50 dark:bg-emerald-900/20"
    borderColor = "border-emerald-200 dark:border-emerald-900/50"
    StatusIcon = ArrowUpRight
    statusText = "صعود"
  } else if (currentDollar?.status === "down") {
    statusColor = "text-red-500"
    bgColor = "bg-red-50 dark:bg-red-900/20"
    borderColor = "border-red-200 dark:border-red-900/50"
    StatusIcon = ArrowDownRight
    statusText = "نزول"
  }

  // Calculate min and max for chart Y axis to make the line more dynamic
  const prices = chartData.map(d => d.price)
  const minPrice = prices.length ? Math.min(...prices) - 250 : 'auto'
  const maxPrice = prices.length ? Math.max(...prices) + 250 : 'auto'

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl text-center md:text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">الدولار الأمريكي</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">متابعة حية لسعر صرف الدولار مقابل الدينار العراقي</p>
          </div>
        </div>
      </div>

      {/* Main Dollar Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`col-span-1 md:col-span-3 lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-8 border ${borderColor} shadow-lg relative overflow-hidden transition-all duration-500`}>
          <div className={`absolute top-0 right-0 w-full h-2 ${bgColor.split(' ')[0]}`}></div>
          
          <h2 className="text-slate-500 dark:text-slate-400 font-bold mb-2 flex items-center gap-2">
            سعر الصرف لـ 100 دولار
            {isLoading ? (
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></span>
            ) : (
                <span className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`}></span>
            )}
          </h2>

          <div className="flex items-center gap-4 mt-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor} ${statusColor}`}>
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-end gap-2">
                <span className={`text-4xl md:text-5xl font-black font-mono tracking-tight ${statusColor}`}>
                  {currentDollar?.price ? currentDollar.price.toLocaleString("en-US") : "---"}
                </span>
                <span className="text-lg font-bold text-slate-500 mb-1">د.ع</span>
              </div>
            </div>
          </div>

          <div className={`mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${bgColor} ${statusColor}`}>
            <StatusIcon className="w-5 h-5" />
            الحالة: {statusText}
          </div>
          
          {currentDollar?.previous && currentDollar.price !== currentDollar.previous && (
            <div className="mt-4 text-sm font-medium text-slate-500">
              السعر السابق: <span className="font-mono">{currentDollar.previous.toLocaleString("en-US")}</span> د.ع
            </div>
          )}
        </div>

        {/* Chart Section */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              مؤشر حركة الدولار (الكفاح)
            </h2>
          </div>
          
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="timeLabel" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }}
                    dy={10}
                  />
                  <YAxis 
                    domain={[minPrice, maxPrice]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }}
                    tickFormatter={(value) => value.toLocaleString()}
                    dx={-10}
                    orientation="right"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} د.ع`, 'السعر']}
                    labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                لا توجد بيانات كافية لرسم المخطط
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
