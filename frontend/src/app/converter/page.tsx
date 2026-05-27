"use client"

import { useEffect, useState, useMemo } from "react"
import { ArrowDownUp, DollarSign, Wallet, Calculator, ArrowRightLeft, Scale, Sparkles, Gem, ChevronDown } from "lucide-react"
import { useSettings } from "@/components/settings-provider"

interface BourseItem {
  price: number;
}
interface BourseData {
  kifah: BourseItem;
}

interface MetalData {
  price: number;
}

export default function ConverterPage() {
  const { settings } = useSettings()
  const [bourses, setBourses] = useState<BourseData | null>(null)
  const [metals, setMetals] = useState<{ gold: MetalData, silver: MetalData } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [fromAssetId, setFromAssetId] = useState<string>('usd')
  const [toAssetId, setToAssetId] = useState<string>('iqd')
  const [amountStr, setAmountStr] = useState("100")
  
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false)
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchData = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      try {
        const [bRes, mRes] = await Promise.all([
          fetch("/api/bourses"),
          fetch("/api/metals")
        ]);
        const bData = await bRes.json();
        const mData = await mRes.json();
        
        if (bData.success) setBourses(bData.data);
        if (mData.success) setMetals({ gold: mData.gold, silver: mData.silver });
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData(true)
    const interval = setInterval(() => fetchData(false), settings.refreshRate)
    return () => clearInterval(interval)
  }, [settings.refreshRate])

  // Calculate prices in IQD
  const pricesInIqd = useMemo(() => {
    const bourseName = settings.defaultBourse as keyof BourseData;
    const dollarRate = bourses && bourses[bourseName] ? bourses[bourseName].price / 100 : 1465;
    const goldOzUsd = metals ? metals.gold.price : 2350;
    const silverOzUsd = metals ? metals.silver.price : 30;
    const TROY_OUNCE_GRAMS = 31.1034768;

    const goldGram24K_IQD = (goldOzUsd / TROY_OUNCE_GRAMS) * dollarRate;

    return {
      iqd: 1,
      usd: dollarRate,
      mithqal24k: goldGram24K_IQD * 5,
      mithqal22k: (goldGram24K_IQD * (22 / 24)) * 5,
      mithqal21k: (goldGram24K_IQD * (21 / 24)) * 5,
      mithqal18k: (goldGram24K_IQD * (18 / 24)) * 5,
      silver_oz: silverOzUsd * dollarRate,
      silver_g: (silverOzUsd / TROY_OUNCE_GRAMS) * dollarRate,
    }
  }, [bourses, metals])

  const ASSETS = [
    { id: 'iqd', name: 'دينار عراقي (IQD)', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { id: 'usd', name: 'دولار أمريكي (USD)', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'mithqal24k', name: 'مثقال ذهب عيار 24', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { id: 'mithqal22k', name: 'مثقال ذهب عيار 22', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { id: 'mithqal21k', name: 'مثقال ذهب عيار 21', icon: Scale, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'mithqal18k', name: 'مثقال ذهب عيار 18', icon: Sparkles, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { id: 'silver_oz', name: 'أونصة فضة', icon: Gem, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'silver_g', name: 'غرام فضة', icon: Gem, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  ];

  const fromAsset = ASSETS.find(a => a.id === fromAssetId)!;
  const toAsset = ASSETS.find(a => a.id === toAssetId)!;

  // Handle Input Change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    if (!rawValue) {
      setAmountStr("");
      return;
    }
    // Prevent multiple dots
    const parts = rawValue.split('.');
    let cleaned = parts[0];
    if (parts.length > 1) cleaned += '.' + parts[1].slice(0, 4); // max 4 decimals
    
    // Format integer part with commas
    const numParts = cleaned.split('.');
    numParts[0] = parseInt(numParts[0] || '0', 10).toLocaleString('en-US');
    setAmountStr(numParts.join('.'));
  }

  const handleSwap = () => {
    setFromAssetId(toAssetId)
    setToAssetId(fromAssetId)
    setAmountStr("")
  }

  // Calculate Output
  const rawAmountNum = parseFloat(amountStr.replace(/,/g, '') || "0");
  const fromPriceIqd = pricesInIqd[fromAssetId as keyof typeof pricesInIqd];
  const toPriceIqd = pricesInIqd[toAssetId as keyof typeof pricesInIqd];
  
  const convertedAmount = (rawAmountNum * fromPriceIqd) / toPriceIqd;

  const formattedOutput = convertedAmount > 0 
    ? convertedAmount.toLocaleString('en-US', { maximumFractionDigits: convertedAmount < 100 ? 3 : 0 }) 
    : "0";

  // Quick Preset Buttons
  const presets = fromAssetId === 'iqd' ? [100000, 500000, 1000000, 5000000] : 
                  fromAssetId === 'usd' ? [100, 500, 1000, 10000] :
                  [1, 5, 10, 50]; // For metals

  const setPreset = (val: number) => {
    setAmountStr(val.toLocaleString('en-US'))
  }

  // Tafqeet Terms
  const formatIraqiTerms = (num: number, assetId: string) => {
    if (num === 0) return "";
    
    if (assetId === 'usd') {
      if (num >= 10000) {
        const dafatir = +(num / 10000).toFixed(2);
        const waraq = +(num / 100).toFixed(2);
        return `(${dafatir} دفتر) ≡ (${waraq} ورقة)`;
      } else if (num >= 100) {
        const waraq = +(num / 100).toFixed(2);
        return `(${waraq} ورقة)`;
      }
    } else if (assetId === 'iqd') {
      if (num >= 1e9) return `(${(num / 1e9).toFixed(2).replace(/\.00$/, '')} مليار دينار)`;
      if (num >= 1e6) return `(${(num / 1e6).toFixed(2).replace(/\.00$/, '')} مليون دينار)`;
      if (num >= 1e3) return `(${(num / 1e3).toFixed(2).replace(/\.00$/, '')} ألف دينار)`;
    }
    return "";
  }

  const CustomDropdown = ({ selected, onSelect, isOpen, setIsOpen, label }: any) => {
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 w-full bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-sm border ${isOpen ? 'border-blue-500' : 'border-slate-200 dark:border-slate-700'} hover:border-blue-400 transition-colors`}
        >
          <div className={`p-2 rounded-xl ${selected.bg}`}>
            <selected.icon className={`w-5 h-5 ${selected.color}`} />
          </div>
          <div className="flex flex-col items-start flex-1 text-right">
            <span className="text-xs font-bold text-slate-400">{label}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{selected.name}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-64 overflow-y-auto z-50 p-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {ASSETS.map(asset => (
              <button
                key={asset.id}
                onClick={() => { onSelect(asset.id); setIsOpen(false); }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${selected.id === asset.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <div className={`p-1.5 rounded-lg ${asset.bg}`}>
                  <asset.icon className={`w-4 h-4 ${asset.color}`} />
                </div>
                <span className={`font-bold text-sm ${selected.id === asset.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {asset.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10 px-4 sm:px-0">
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center md:text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900/50">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">المحول المالي الشامل</h1>
            <p className="text-slate-400 mt-2 text-lg font-medium">تحويل دقيق ومباشر بين العملات والمعادن الثمينة</p>
          </div>
        </div>
      </div>

      {/* Main Calculator Body */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

        <div className="p-6 md:p-8">
          
          <div className="relative flex flex-col md:flex-row gap-6 items-stretch">
            
            {/* FROM SECTION */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
              <CustomDropdown 
                label="التحويل من"
                selected={fromAsset} 
                onSelect={setFromAssetId} 
                isOpen={isFromDropdownOpen} 
                setIsOpen={(val: boolean) => { setIsFromDropdownOpen(val); setIsToDropdownOpen(false); }} 
              />
              
              <div className="mt-6">
                <input 
                  type="text" 
                  value={amountStr}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-transparent text-4xl md:text-5xl font-black font-mono text-slate-900 dark:text-white outline-none placeholder-slate-300 dark:placeholder-slate-700 tracking-tight"
                  dir="ltr"
                />
              </div>
              
              <div className="min-h-[24px] mt-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm tracking-wide">
                  {formatIraqiTerms(rawAmountNum, fromAssetId)}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 mt-6">
                {presets.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPreset(p)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-mono font-bold transition-colors shadow-sm"
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
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 transform hover:rotate-180 hover:scale-110 transition-all duration-500 flex items-center justify-center"
                title="تبديل"
              >
                <ArrowRightLeft className="w-6 h-6 hidden md:block" />
                <ArrowDownUp className="w-6 h-6 md:hidden" />
              </button>
            </div>

            {/* TO SECTION */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-3xl p-5 md:p-6 border border-blue-100 dark:border-blue-800/30 relative overflow-hidden">
              <div className="relative z-10">
                <CustomDropdown 
                  label="النتيجة بـ"
                  selected={toAsset} 
                  onSelect={setToAssetId} 
                  isOpen={isToDropdownOpen} 
                  setIsOpen={(val: boolean) => { setIsToDropdownOpen(val); setIsFromDropdownOpen(false); }} 
                />

                <div className="mt-6 text-4xl md:text-5xl font-black font-mono text-blue-700 dark:text-blue-400 tracking-tight break-all">
                  {isLoading ? <span className="animate-pulse opacity-50">...</span> : formattedOutput}
                </div>
                
                <div className="min-h-[24px] mt-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide">
                    {formatIraqiTerms(convertedAmount, toAssetId)}
                  </span>
                </div>
              </div>

              {/* Decorative Background Icon */}
              <div className="absolute -bottom-6 -left-6 opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
                <toAsset.icon className="w-48 h-48" />
              </div>
            </div>

          </div>

          <div className="mt-8 text-center text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            يتم التحويل بناءً على السعر اللحظي لبورصة {settings.defaultBourse === 'erbil' ? 'أربيل' : settings.defaultBourse === 'basra' ? 'البصرة' : settings.defaultBourse === 'harthiya' ? 'الحارثية' : 'الكفاح'} وأسعار المعادن العالمية
          </div>

        </div>
      </div>
    </div>
  )
}
