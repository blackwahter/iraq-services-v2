"use client"

import { useEffect, useState } from "react"
import { ArrowDownUp, DollarSign, Wallet, Calculator, ArrowRightLeft } from "lucide-react"

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
  kifah: "بغداد - الكفاح",
  harthiya: "بغداد - الحارثية",
  erbil: "أربيل",
  basra: "البصرة"
}

export default function ConverterPage() {
  const [bourses, setBourses] = useState<BourseData | null>(null)
  const [activeCity, setActiveCity] = useState<keyof typeof CITIES>('kifah')
  const [isLoading, setIsLoading] = useState(true)

  // Mode: true = USD to IQD, false = IQD to USD
  const [isUsdToIqd, setIsUsdToIqd] = useState(true)
  
  // Amount stored as raw string to handle typing (e.g., "1,000,000")
  const [amountStr, setAmountStr] = useState("100")

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
      } finally {
        setIsLoading(false)
      }
    }
    fetchBourses()
    const interval = setInterval(fetchBourses, 30000)
    return () => clearInterval(interval)
  }, [])

  const currentRate = bourses ? bourses[activeCity].price : 146500;
  // Rate is per 100 USD. So 1 USD = rate / 100.
  const exchangeRate = currentRate / 100;

  // Handle Input Change (with commas)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove anything that is not a digit
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setAmountStr("");
      return;
    }
    // Convert to number and back to locale string to add commas
    const formatted = parseInt(rawValue, 10).toLocaleString('en-US');
    setAmountStr(formatted);
  }

  // Swap currencies
  const handleSwap = () => {
    setIsUsdToIqd(!isUsdToIqd)
    setAmountStr("")
  }

  // Calculate Output
  const rawAmountNum = parseInt(amountStr.replace(/,/g, '') || "0", 10);
  let convertedAmount = 0;
  
  if (isUsdToIqd) {
    convertedAmount = rawAmountNum * exchangeRate;
  } else {
    convertedAmount = rawAmountNum / exchangeRate;
  }

  const formattedOutput = convertedAmount > 0 
    ? convertedAmount.toLocaleString('en-US', { maximumFractionDigits: 0 }) 
    : "0";

  // Quick Preset Buttons
  const presets = isUsdToIqd 
    ? [100, 500, 1000, 10000] // USD presets
    : [100000, 500000, 1000000, 5000000]; // IQD presets

  const setPreset = (val: number) => {
    setAmountStr(val.toLocaleString('en-US'))
  }

  // --- Iraqi Formatting Helpers (Tafqeet & Terms) ---
  const formatIraqiTerms = (num: number, isUSD: boolean) => {
    if (num === 0) return "";
    
    if (isUSD) {
      // USD Terms: Waraqa (100$) and Daftar (10,000$)
      if (num >= 10000) {
        const dafatir = +(num / 10000).toFixed(2);
        const waraq = +(num / 100).toFixed(2);
        return `(${dafatir} دفتر) ≡ (${waraq} ورقة)`;
      } else if (num >= 100) {
        const waraq = +(num / 100).toFixed(2);
        return `(${waraq} ورقة)`;
      }
      return "";
    } else {
      // IQD Terms: Millions, Billions
      if (num >= 1e9) {
        return `(${(num / 1e9).toFixed(2).replace(/\.00$/, '')} مليار دينار)`;
      } else if (num >= 1e6) {
        return `(${(num / 1e6).toFixed(2).replace(/\.00$/, '')} مليون دينار)`;
      } else if (num >= 1e3) {
        return `(${(num / 1e3).toFixed(2).replace(/\.00$/, '')} ألف دينار)`;
      }
      return "";
    }
  }

  const inputTerm = formatIraqiTerms(rawAmountNum, isUsdToIqd);
  const outputTerm = formatIraqiTerms(convertedAmount, !isUsdToIqd);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10 px-4 sm:px-0">
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center md:text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-900/50">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">المحول المالي (الحاسبة)</h1>
            <p className="text-slate-400 mt-2 text-lg font-medium">حاسبة دقيقة لتحويل العملات معتمدة على الأسعار اللحظية للبورصة</p>
          </div>
        </div>
      </div>

      {/* Main Calculator Body */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

        <div className="p-8">
          {/* Bourse Selector */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
              سعر الصرف المعتمد (اختر البورصة)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(CITIES) as Array<keyof typeof CITIES>).map((cityKey) => {
                const isActive = activeCity === cityKey;
                const price = bourses ? bourses[cityKey].price : 0;
                return (
                  <button
                    key={cityKey}
                    onClick={() => setActiveCity(cityKey)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 border-2 ${
                      isActive 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400' 
                        : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="font-bold mb-1">{CITIES[cityKey]}</span>
                    <span className="font-mono text-sm opacity-80">{price ? price.toLocaleString() : '---'} د.ع</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative flex flex-col md:flex-row gap-6 items-stretch">
            
            {/* INPUT SECTION */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 dark:text-slate-400 font-bold">المبلغ للتحويل</span>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  {isUsdToIqd ? <DollarSign className="w-4 h-4 text-emerald-500" /> : <Wallet className="w-4 h-4 text-amber-500" />}
                  <span className="font-bold text-slate-700 dark:text-slate-300">{isUsdToIqd ? 'دولار أمريكي (USD)' : 'دينار عراقي (IQD)'}</span>
                </div>
              </div>
              
              <input 
                type="text" 
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent text-4xl md:text-5xl font-black font-mono text-slate-900 dark:text-white outline-none placeholder-slate-300 dark:placeholder-slate-700 tracking-tight"
                dir="ltr"
              />
              
              <div className="min-h-[24px] mt-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide">
                  {inputTerm}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 mt-6">
                {presets.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPreset(p)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-mono font-bold transition-colors shadow-sm"
                  >
                    {p.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* SWAP BUTTON */}
            <div className="flex items-center justify-center -my-3 md:-mx-3 md:my-0 relative z-10">
              <button 
                onClick={handleSwap}
                className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/30 transform hover:rotate-180 hover:scale-110 transition-all duration-500 flex items-center justify-center"
                title="تبديل العملات"
              >
                <ArrowRightLeft className="w-6 h-6 hidden md:block" />
                <ArrowDownUp className="w-6 h-6 md:hidden" />
              </button>
            </div>

            {/* OUTPUT SECTION */}
            <div className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/50 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">النتيجة بعد التحويل</span>
                <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
                  {!isUsdToIqd ? <DollarSign className="w-4 h-4 text-emerald-500" /> : <Wallet className="w-4 h-4 text-amber-500" />}
                  <span className="font-bold text-slate-700 dark:text-slate-300">{!isUsdToIqd ? 'دولار أمريكي (USD)' : 'دينار عراقي (IQD)'}</span>
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="text-4xl md:text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight break-all">
                  {formattedOutput}
                </div>
                
                <div className="min-h-[24px] mt-2">
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-sm tracking-wide">
                    {outputTerm}
                  </span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 text-emerald-500/10 dark:text-emerald-500/5 pointer-events-none">
                {!isUsdToIqd ? <DollarSign className="w-48 h-48" /> : <Wallet className="w-48 h-48" />}
              </div>
            </div>

          </div>

          <div className="mt-8 text-center text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            سعر الصرف المعمول به حالياً: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{exchangeRate}</span> دينار عراقي لكل دولار واحد 
            <br className="md:hidden" />
            <span className="hidden md:inline"> | </span> 
            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">100$ = {currentRate.toLocaleString()} د.ع</span>
          </div>

        </div>
      </div>
    </div>
  )
}
