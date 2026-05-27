"use client"

import { useEffect, useState } from "react"
import { Coins, Sparkles, Scale, TrendingUp, Gem } from "lucide-react"

export default function MetalsPage() {
  const [metals, setMetals] = useState<{ gold: number, silver: number } | null>(null)
  const [dollarRate, setDollarRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch global metals prices
        const metalsRes = await fetch("/api/metals")
        const metalsData = await metalsRes.json()
        
        // Fetch local dollar rate to calculate IQD prices
        const boursesRes = await fetch("/api/bourses")
        const boursesData = await boursesRes.json()
        
        if (metalsData.success && boursesData.success) {
          setMetals({ gold: metalsData.gold, silver: metalsData.silver })
          setDollarRate(boursesData.data.kifah.price / 100) // Price per 1 USD
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every 1 minute
    return () => clearInterval(interval)
  }, [])

  // 1 Troy Ounce = 31.1034768 Grams
  const TROY_OUNCE_GRAMS = 31.1034768

  // Calculate base 24K price per gram in IQD
  const goldGram24K_IQD = metals && dollarRate ? (metals.gold / TROY_OUNCE_GRAMS) * dollarRate : 0
  
  // Calculate specific karats
  const goldGram22K_IQD = goldGram24K_IQD * (22 / 24)
  const goldGram21K_IQD = goldGram24K_IQD * (21 / 24)
  const goldGram18K_IQD = goldGram24K_IQD * (18 / 24)
  
  // Calculate Iraqi Mithqal (5 grams of 21K)
  const mithqal21K_IQD = goldGram21K_IQD * 5

  // Silver calculations
  const silverGram_IQD = metals && dollarRate ? (metals.silver / TROY_OUNCE_GRAMS) * dollarRate : 0

  const formatPrice = (price: number) => {
    return Math.round(price).toLocaleString("en-US")
  }

  const MetalCard = ({ title, value, subtitle, icon: Icon, colorClass, gradientClass, delay = 0 }: any) => (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute top-0 right-0 w-full h-1 ${gradientClass}`}></div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">{title}</h3>
        <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        {isLoading ? (
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        ) : (
          <>
            <span className={`text-3xl font-black font-mono tracking-tight ${colorClass.replace('bg-', 'text-')}`}>
              {formatPrice(value)}
            </span>
            <span className="text-sm font-bold text-slate-500 mb-1">د.ع</span>
          </>
        )}
      </div>
      <p className="text-sm text-slate-500 mt-2 font-medium">{subtitle}</p>
    </div>
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl text-center md:text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/30">
            <Coins className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">الذهب والفضة</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">أسعار المعادن الثمينة محدثة لحظة بلحظة ومقومة بالدينار العراقي</p>
          </div>
        </div>
        
        {metals && (
          <div className="mt-6 flex flex-wrap gap-4 items-center justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              أونصة الذهب عالمياً: <span className="font-mono text-amber-500">${metals.gold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              أونصة الفضة عالمياً: <span className="font-mono text-slate-400">${metals.silver.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Featured: Iraqi Mithqal */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 rounded-3xl p-8 border border-amber-200 dark:border-amber-800/50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-2xl text-amber-600 dark:text-amber-400">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">سعر المثقال العراقي</h2>
                <p className="text-amber-600 dark:text-amber-400 font-medium">ذهب عيار 21 (5 غرامات) - السعر الخام</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              هذا هو السعر الخام العالمي مقوماً بسعر صرف البورصة المحلية الحالية، ولا يتضمن أجور الصياغة التي تختلف من صائغ لآخر.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30 text-center min-w-[250px]">
            {isLoading ? (
              <div className="h-12 w-40 bg-slate-200 dark:bg-slate-800 rounded mx-auto animate-pulse"></div>
            ) : (
              <div className="flex items-end justify-center gap-2">
                <span className="text-5xl font-black font-mono tracking-tight text-amber-500">
                  {formatPrice(mithqal21K_IQD)}
                </span>
                <span className="text-xl font-bold text-slate-500 mb-1">د.ع</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetalCard 
          title="غرام الذهب عيار 24" 
          value={goldGram24K_IQD} 
          subtitle="الذهب الخالص (999.9)" 
          icon={Sparkles} 
          colorClass="bg-yellow-500" 
          gradientClass="bg-gradient-to-r from-yellow-400 to-yellow-600"
          delay={100}
        />
        <MetalCard 
          title="غرام الذهب عيار 22" 
          value={goldGram22K_IQD} 
          subtitle="ذهب السبائك والمشغولات" 
          icon={Sparkles} 
          colorClass="bg-amber-500" 
          gradientClass="bg-gradient-to-r from-amber-400 to-amber-600"
          delay={200}
        />
        <MetalCard 
          title="غرام الذهب عيار 21" 
          value={goldGram21K_IQD} 
          subtitle="الأكثر انتشاراً في العراق" 
          icon={Sparkles} 
          colorClass="bg-orange-500" 
          gradientClass="bg-gradient-to-r from-orange-400 to-orange-600"
          delay={300}
        />
        <MetalCard 
          title="غرام الذهب عيار 18" 
          value={goldGram18K_IQD} 
          subtitle="ذهب المشغولات الدقيقة" 
          icon={Sparkles} 
          colorClass="bg-rose-500" 
          gradientClass="bg-gradient-to-r from-rose-400 to-rose-600"
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <MetalCard 
          title="غرام الفضة الخالصة" 
          value={silverGram_IQD} 
          subtitle="فضة عيار 999" 
          icon={Gem} 
          colorClass="bg-slate-400" 
          gradientClass="bg-gradient-to-r from-slate-300 to-slate-500"
          delay={500}
        />
        <MetalCard 
          title="أونصة الفضة عالمياً (بالدينار)" 
          value={silverGram_IQD * TROY_OUNCE_GRAMS} 
          subtitle="سعر أونصة الفضة (31.1 غرام)" 
          icon={Gem} 
          colorClass="bg-slate-500" 
          gradientClass="bg-gradient-to-r from-slate-400 to-slate-600"
          delay={600}
        />
      </div>
    </div>
  )
}
