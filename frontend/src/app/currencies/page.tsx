"use client"

import { useEffect, useState } from "react"
import { DollarSign, ArrowUpRight, ArrowDownRight, Minus, Activity, MapPin } from "lucide-react"
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
  harthiya: BourseItem;
  erbil: BourseItem;
  basra: BourseItem;
  lastUpdated: string;
}

const CITIES = {
  kifah: "بورصة الكفاح (بغداد)",
  harthiya: "بورصة الحارثية (بغداد)",
  erbil: "بورصة أربيل (الشمال)",
  basra: "بورصة البصرة (الجنوب)"
}

export default function CurrenciesPage() {
  const [bourses, setBourses] = useState<BourseData | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCity, setActiveCity] = useState<keyof typeof CITIES>('kifah')

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
          const formattedData = data.data.map((item: any) => ({
            ...item,
            timeLabel: new Date(item.time).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
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

  const currentDollar = bourses ? bourses[activeCity] : null;

  // Determine styles based on status for the active city
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

  // Calculate min and max for chart Y axis based on active city
  const prices = chartData.map(d => d[activeCity])
  const minPrice = prices.length ? Math.min(...prices) - 150 : 'auto'
  const maxPrice = prices.length ? Math.max(...prices) + 150 : 'auto'

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
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">الدولار الأمريكي (مباشر)</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">متابعة دقيقة لأسعار الصرف في مختلف المحافظات العراقية</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Side Card */}
        <div className={`col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border ${borderColor} shadow-lg relative overflow-hidden transition-all duration-500 flex flex-col`}>
          <div className={`absolute top-0 right-0 w-full h-2 ${bgColor.split(' ')[0]}`}></div>
          
          <h2 className="text-slate-500 dark:text-slate-400 font-bold mb-2 flex items-center gap-2">
            سعر الصرف لـ 100 دولار
            {isLoading ? (
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></span>
            ) : (
                <span className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`}></span>
            )}
          </h2>

          <div className="flex items-center gap-4 mt-4">
            <div>
              <div className="flex items-end gap-2">
                <span className={`text-4xl md:text-5xl font-black font-mono tracking-tight ${statusColor} transition-colors duration-500`}>
                  {currentDollar?.price ? currentDollar.price.toLocaleString("en-US") : "---"}
                </span>
                <span className="text-lg font-bold text-slate-500 mb-1">د.ع</span>
              </div>
            </div>
          </div>

          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold w-max transition-colors duration-500 ${bgColor} ${statusColor}`}>
            <StatusIcon className="w-5 h-5" />
            الحالة: {statusText}
            {currentDollar?.previous && currentDollar.price !== currentDollar.previous && (
              <span className="text-sm opacity-80 border-r border-current pr-2 mr-2">كان {currentDollar.previous.toLocaleString("en-US")}</span>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">اختر البورصة لعرض تفاصيلها</h3>
            <div className="flex flex-col gap-3">
              {(Object.keys(CITIES) as Array<keyof typeof CITIES>).map((cityKey) => {
                const isActive = activeCity === cityKey;
                const cityData = bourses ? bourses[cityKey] : null;
                
                let iconColor = "text-slate-400";
                if (cityData?.status === 'up') iconColor = "text-emerald-500";
                else if (cityData?.status === 'down') iconColor = "text-red-500";
                else if (cityData?.status === 'stable') iconColor = "text-yellow-500";

                return (
                  <button
                    key={cityKey}
                    onClick={() => setActiveCity(cityKey)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                      isActive 
                        ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10 dark:bg-blue-900/20 dark:border-blue-500/50' 
                        : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className={`font-bold ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {CITIES[cityKey].split(' ')[1]} {/* فقط اسم المحافظة */}
                      </span>
                    </div>
                    
                    {cityData && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {cityData.price.toLocaleString("en-US")}
                        </span>
                        {cityData.status === 'up' && <ArrowUpRight className={`w-4 h-4 ${iconColor}`} />}
                        {cityData.status === 'down' && <ArrowDownRight className={`w-4 h-4 ${iconColor}`} />}
                        {cityData.status === 'stable' && <Minus className={`w-4 h-4 ${iconColor}`} />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Chart Section */}
        <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              مؤشر حركة الدولار <span className="text-blue-500">({CITIES[activeCity]})</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-500">رسم بياني مباشر</span>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[350px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis 
                    dataKey="timeLabel" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
                    dy={15}
                  />
                  <YAxis 
                    domain={[minPrice, maxPrice]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
                    tickFormatter={(value) => value.toLocaleString()}
                    dx={-15}
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
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={activeCity} 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={1500}
                    // Adding visible dots on every data point to show ups/downs clearly
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#3b82f6" }}
                    // Emphasizing the active dot on hover
                    activeDot={{ r: 8, strokeWidth: 3, fill: "#3b82f6", stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <Activity className="w-12 h-12 opacity-20" />
                <p>لا توجد بيانات كافية لرسم المخطط حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
