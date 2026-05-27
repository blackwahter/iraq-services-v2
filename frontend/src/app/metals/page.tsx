"use client"

import { useEffect, useState } from "react"
import { Coins, Sparkles, Scale, TrendingUp, Gem, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface MetalData {
  price: number;
  previous: number;
}

export default function MetalsPage() {
  const [metals, setMetals] = useState<{ gold: MetalData, silver: MetalData } | null>(null)
  const [dollar, setDollar] = useState<{ price: number, previous: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      try {
        const metalsRes = await fetch("/api/metals")
        const metalsData = await metalsRes.json()
        
        const boursesRes = await fetch("/api/bourses")
        const boursesData = await boursesRes.json()
        
        if (metalsData.success && boursesData.success) {
          setMetals({ gold: metalsData.gold, silver: metalsData.silver })
          setDollar({ 
            price: boursesData.data.kifah.price / 100,
            previous: boursesData.data.kifah.previous / 100 
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData(true)
    const interval = setInterval(() => fetchData(false), 60000) 
    return () => clearInterval(interval)
  }, [])

  const TROY_OUNCE_GRAMS = 31.1034768

  // Calculate base 24K price per gram in IQD (Current)
  const goldGram24K_IQD = metals && dollar ? (metals.gold.price / TROY_OUNCE_GRAMS) * dollar.price : 0
  const prevGoldGram24K_IQD = metals && dollar ? (metals.gold.previous / TROY_OUNCE_GRAMS) * dollar.previous : 0
  
  // Calculate specific karats (Current)
  const goldGram22K_IQD = goldGram24K_IQD * (22 / 24)
  const goldGram21K_IQD = goldGram24K_IQD * (21 / 24)
  const goldGram18K_IQD = goldGram24K_IQD * (18 / 24)
  const mithqal21K_IQD = goldGram21K_IQD * 5

  // Calculate specific karats (Previous)
  const prevGoldGram22K_IQD = prevGoldGram24K_IQD * (22 / 24)
  const prevGoldGram21K_IQD = prevGoldGram24K_IQD * (21 / 24)
  const prevGoldGram18K_IQD = prevGoldGram24K_IQD * (18 / 24)
  const prevMithqal21K_IQD = prevGoldGram21K_IQD * 5

  // Silver calculations (Current and Previous)
  const silverGram_IQD = metals && dollar ? (metals.silver.price / TROY_OUNCE_GRAMS) * dollar.price : 0
  const prevSilverGram_IQD = metals && dollar ? (metals.silver.previous / TROY_OUNCE_GRAMS) * dollar.previous : 0

  const formatPrice = (price: number) => {
    return Math.round(price).toLocaleString("en-US")
  }

  const getStatusInfo = (current: number, previous: number) => {
    if (!current || !previous) return { icon: Minus, color: "text-slate-400" };
    if (Math.round(current) > Math.round(previous)) return { icon: ArrowUpRight, color: "text-emerald-400" };
    if (Math.round(current) < Math.round(previous)) return { icon: ArrowDownRight, color: "text-red-400" };
    return { icon: Minus, color: "text-yellow-400" };
  }

  const MetalCard = ({ title, value, prevValue, subtitle, icon: Icon, theme, delay = 0 }: any) => {
    const status = getStatusInfo(value, prevValue);
    const StatusIcon = status.icon;

    // Elegant themes mapping
    const themes = {
      gold: {
        wrapper: "from-yellow-900/40 via-amber-900/20 to-slate-900 border-yellow-700/30 hover:border-yellow-500/50 shadow-yellow-900/20",
        iconBg: "bg-gradient-to-br from-yellow-500 to-amber-700",
        iconText: "text-white",
        valueText: "text-yellow-500",
        titleText: "text-yellow-100",
        accentLine: "from-yellow-400 via-amber-500 to-yellow-600"
      },
      silver: {
        wrapper: "from-slate-800 via-slate-800/80 to-slate-900 border-slate-600/30 hover:border-slate-400/50 shadow-slate-900/20",
        iconBg: "bg-gradient-to-br from-slate-300 to-slate-500",
        iconText: "text-slate-900",
        valueText: "text-slate-300",
        titleText: "text-slate-100",
        accentLine: "from-slate-300 via-slate-400 to-slate-500"
      }
    };

    const currentTheme = themes[theme as keyof typeof themes];

    return (
      <div className={`bg-gradient-to-br ${currentTheme.wrapper} p-6 rounded-3xl border shadow-lg relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up flex flex-col justify-between min-h-[160px]`} style={{ animationDelay: `${delay}ms` }}>
        <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-r opacity-70 group-hover:opacity-100 transition-opacity ${currentTheme.accentLine}`}></div>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className={`text-lg font-bold ${currentTheme.titleText}`}>{title}</h3>
          <div className={`p-2.5 rounded-xl ${currentTheme.iconBg} shadow-lg`}>
            <Icon className={`w-5 h-5 ${currentTheme.iconText}`} />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-end gap-2">
              {isLoading ? (
                <div className="h-10 w-32 bg-slate-800 rounded animate-pulse"></div>
              ) : (
                <>
                  <span className={`text-3xl font-black font-mono tracking-tight ${currentTheme.valueText}`}>
                    {formatPrice(value)}
                  </span>
                  <span className="text-sm font-bold text-slate-500 mb-1">د.ع</span>
                </>
              )}
            </div>
            
            {!isLoading && (
              <div className={`flex items-center gap-1 ${status.color} bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5`}>
                <StatusIcon className="w-4 h-4" />
              </div>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-3 font-medium border-t border-white/5 pt-2">{subtitle}</p>
        </div>
      </div>
    );
  }

  const mithqalStatus = getStatusInfo(mithqal21K_IQD, prevMithqal21K_IQD);
  const MithqalIcon = mithqalStatus.icon;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center md:text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-amber-800 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-900/50 border border-yellow-500/20">
            <Coins className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">الذهب والفضة</h1>
            <p className="text-slate-400 mt-2 text-lg font-medium">أسعار المعادن الثمينة محدثة لحظة بلحظة ومقومة بالدينار العراقي</p>
          </div>
        </div>
      </div>

      {/* Featured: Iraqi Mithqal (Dark Elegant Theme) */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 rounded-3xl p-8 border border-amber-700/30 shadow-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all duration-500 transform hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-700 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-900/10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-yellow-600 to-amber-800 p-3 rounded-2xl text-white shadow-lg border border-yellow-500/20">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">سعر المثقال العراقي</h2>
                <p className="text-yellow-500 font-medium mt-1">ذهب عيار 21 (5 غرامات) - السعر الخام</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed border-r-2 border-amber-800/50 pr-4">
              هذا هو السعر الخام العالمي مقوماً بسعر صرف البورصة المحلية الحالية، ولا يتضمن أجور الصياغة التي تختلف من صائغ لآخر.
            </p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-inner border border-white/5 text-center min-w-[280px] relative overflow-hidden group-hover:bg-black/50 transition-colors">
            {isLoading ? (
              <div className="h-12 w-40 bg-slate-800 rounded mx-auto animate-pulse"></div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                    {formatPrice(mithqal21K_IQD)}
                  </span>
                  <span className="text-xl font-bold text-slate-400 mb-2">د.ع</span>
                </div>
                <div className={`mt-3 flex items-center gap-1.5 ${mithqalStatus.color} text-sm font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5`}>
                  <MithqalIcon className="w-4 h-4" />
                  <span>
                    {mithqalStatus.icon === ArrowUpRight ? "في صعود" : mithqalStatus.icon === ArrowDownRight ? "في نزول" : "مستقر"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gold Grams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetalCard 
          title="غرام الذهب عيار 24" 
          value={goldGram24K_IQD} 
          prevValue={prevGoldGram24K_IQD}
          subtitle="الذهب الخالص (999.9)" 
          icon={Sparkles} 
          theme="gold"
          delay={100}
        />
        <MetalCard 
          title="غرام الذهب عيار 22" 
          value={goldGram22K_IQD} 
          prevValue={prevGoldGram22K_IQD}
          subtitle="ذهب السبائك والمشغولات" 
          icon={Sparkles} 
          theme="gold"
          delay={200}
        />
        <MetalCard 
          title="غرام الذهب عيار 21" 
          value={goldGram21K_IQD} 
          prevValue={prevGoldGram21K_IQD}
          subtitle="الأكثر انتشاراً في العراق" 
          icon={Sparkles} 
          theme="gold"
          delay={300}
        />
        <MetalCard 
          title="غرام الذهب عيار 18" 
          value={goldGram18K_IQD} 
          prevValue={prevGoldGram18K_IQD}
          subtitle="ذهب المشغولات الدقيقة" 
          icon={Sparkles} 
          theme="gold"
          delay={400}
        />
      </div>

      {/* Silver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <MetalCard 
          title="أونصة الفضة عالمياً (بالدينار)" 
          value={silverGram_IQD * TROY_OUNCE_GRAMS} 
          prevValue={prevSilverGram_IQD * TROY_OUNCE_GRAMS}
          subtitle="سعر أونصة الفضة (31.1 غرام)" 
          icon={TrendingUp} 
          theme="silver"
          delay={500}
        />
        <MetalCard 
          title="غرام الفضة الخالصة" 
          value={silverGram_IQD} 
          prevValue={prevSilverGram_IQD}
          subtitle="فضة عيار 999" 
          icon={Gem} 
          theme="silver"
          delay={600}
        />
      </div>
    </div>
  )
}
