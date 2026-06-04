"use client"

import { useEffect, useState, useMemo } from "react"
import { ArrowDownUp, DollarSign, Wallet, Sparkles, Gem, ChevronDown } from "lucide-react"

const ASSETS = [
  { id: 'iqd', name: 'دينار عراقي', nameEn: 'IQD', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'usd', name: 'دولار أمريكي', nameEn: 'USD', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'mithqal24k', name: 'مثقال ذهب عيار 24', nameEn: '24K Mithqal', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'mithqal21k', name: 'مثقال ذهب عيار 21', nameEn: '21K Mithqal', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'silver', name: 'غرام فضة', nameEn: 'Silver', icon: Gem, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
];

export default function ConverterPage() {
  const [bourses, setBourses] = useState<any>(null)
  const [metals, setMetals] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [fromAssetId, setFromAssetId] = useState<string>('usd')
  const [toAssetId, setToAssetId] = useState<string>('iqd')
  const [amountStr, setAmountStr] = useState("100")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const safeFetch = async (url: string) => {
          try {
            const res = await fetch(url)
            if (!res.ok) return null
            return await res.json()
          } catch {
            return null
          }
        }

        const [bData, mData] = await Promise.all([
          safeFetch("/api/bourses"),
          safeFetch("/api/metals")
        ])
        
        if (bData?.success) setBourses(bData.data)
        if (mData?.success) setMetals({ gold: mData.gold, silver: mData.silver })
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const pricesInIqd = useMemo(() => {
    const dollarRate = bourses?.kifah?.price ? bourses.kifah.price / 100 : 1465;
    const goldOzUsd = metals?.gold?.price || 2350;
    const silverOzUsd = metals?.silver?.price || 30;
    const TROY_OUNCE_GRAMS = 31.1034768;

    const goldGram24K_IQD = (goldOzUsd / TROY_OUNCE_GRAMS) * dollarRate;

    return {
      iqd: 1,
      usd: dollarRate,
      mithqal24k: goldGram24K_IQD * 5,
      mithqal21k: (goldGram24K_IQD * (21 / 24)) * 5,
      silver: (silverOzUsd / TROY_OUNCE_GRAMS) * dollarRate,
    }
  }, [bourses, metals])

  const handleSwap = () => {
    setFromAssetId(toAssetId)
    setToAssetId(fromAssetId)
  }

  const fromAsset = ASSETS.find(a => a.id === fromAssetId)!;
  const toAsset = ASSETS.find(a => a.id === toAssetId)!;
  
  const numericAmount = parseFloat(amountStr) || 0;
  const amountInBaseIQD = numericAmount * (pricesInIqd as any)[fromAssetId];
  const finalResult = amountInBaseIQD / (pricesInIqd as any)[toAssetId];

  if (isLoading && !bourses) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="max-w-md mx-auto w-full px-2 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">المحول المالي</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">حسابات دقيقة بناءً على الأسعار الحية</p>
      </div>

      <div className="relative space-y-2">
        {/* FROM INPUT */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative z-10">
          <div className="text-sm text-slate-500 mb-2 font-medium">الكمية التي لديك</div>
          <div className="flex justify-between items-center">
            <select 
              value={fromAssetId}
              onChange={(e) => setFromAssetId(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold text-lg focus:outline-none appearance-none"
            >
              {ASSETS.map(a => <option key={`from-${a.id}`} value={a.id}>{a.nameEn}</option>)}
            </select>
            <input 
              type="text" 
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.]/g, ''))}
              className="bg-transparent text-left font-mono font-black text-3xl w-2/3 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
          <button onClick={handleSwap} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30 border-4 border-slate-50 dark:border-slate-950 active:scale-95 transition-transform">
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>

        {/* TO INPUT */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-inner relative z-10">
          <div className="text-sm text-slate-500 mb-2 font-medium">الكمية التي ستحصل عليها</div>
          <div className="flex justify-between items-center">
            <select 
              value={toAssetId}
              onChange={(e) => setToAssetId(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold text-lg focus:outline-none appearance-none"
            >
              {ASSETS.map(a => <option key={`to-${a.id}`} value={a.id}>{a.nameEn}</option>)}
            </select>
            <div className="text-left font-mono font-black text-3xl w-2/3 text-blue-600 dark:text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap">
              {finalResult.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
