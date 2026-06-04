"use client"

import { useEffect, useState, useMemo } from "react"
import { ArrowDownUp, DollarSign, Wallet, Sparkles, Gem, ArrowRightLeft, ChevronDown, Euro } from "lucide-react"

const ASSETS = [
  { id: 'iqd', name: 'دينار عراقي', nameEn: 'IQD', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'usd', name: 'دولار أمريكي', nameEn: 'USD', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'eur', name: 'يورو أوروبي', nameEn: 'EUR', icon: Euro, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'mithqal24k', name: 'مثقال ذهب عيار 24', nameEn: '24K Mithqal', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'mithqal22k', name: 'مثقال ذهب عيار 22', nameEn: '22K Mithqal', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'mithqal21k', name: 'مثقال ذهب عيار 21', nameEn: '21K Mithqal', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'mithqal18k', name: 'مثقال ذهب عيار 18', nameEn: '18K Mithqal', icon: Sparkles, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'silver', name: 'غرام فضة', nameEn: 'Silver Gram', icon: Gem, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
];

const CustomDropdown = ({ selected, onSelect, isOpen, setIsOpen, label }: any) => {
  const selectedAsset = ASSETS.find(a => a.id === selected) || ASSETS[0];
  const SelectedIcon = selectedAsset.icon;

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-4 flex items-center justify-between transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${selectedAsset.bg}`}>
            <SelectedIcon className={`w-5 h-5 ${selectedAsset.color}`} />
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900 dark:text-white leading-tight">{selectedAsset.nameEn}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{selectedAsset.name}</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {ASSETS.map((asset) => {
              const Icon = asset.icon;
              return (
                <button
                  key={asset.id}
                  onClick={() => { onSelect(asset.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0 ${
                    selected === asset.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className={`p-2 rounded-xl ${asset.bg}`}>
                    <Icon className={`w-5 h-5 ${asset.color}`} />
                  </div>
                  <div className="text-right flex-1">
                    <div className={`font-bold leading-tight ${selected === asset.id ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
                      {asset.nameEn}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{asset.name}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Backdrop for closing dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default function ConverterPage() {
  const [bourses, setBourses] = useState<any>(null)
  const [metals, setMetals] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [fromAssetId, setFromAssetId] = useState<string>('usd')
  const [toAssetId, setToAssetId] = useState<string>('iqd')
  const [amountStr, setAmountStr] = useState("100")
  
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false)
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false)

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
    const dollarRate = bourses?.kifah?.price ? bourses.kifah.price / 100 : 1495;
    const goldOzUsd = metals?.gold?.price || 2350;
    const silverOzUsd = metals?.silver?.price || 30;
    const euroRateUsd = 1.08; // approximate
    const TROY_OUNCE_GRAMS = 31.1034768;

    const goldGram24K_IQD = (goldOzUsd / TROY_OUNCE_GRAMS) * dollarRate;
    const mithqalWeight = 5;

    return {
      iqd: 1,
      usd: dollarRate,
      eur: dollarRate * euroRateUsd,
      mithqal24k: goldGram24K_IQD * mithqalWeight,
      mithqal22k: goldGram24K_IQD * (22/24) * mithqalWeight,
      mithqal21k: goldGram24K_IQD * (21/24) * mithqalWeight,
      mithqal18k: goldGram24K_IQD * (18/24) * mithqalWeight,
      silver: (silverOzUsd / TROY_OUNCE_GRAMS) * dollarRate
    };
  }, [bourses, metals]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const rawValue = val.replace(/,/g, '').replace(/[^0-9.]/g, '');
    if (!rawValue) {
      setAmountStr("");
      return;
    }
    const parts = rawValue.split('.');
    let cleaned = parts[0];
    if (parts.length > 1) cleaned += '.' + parts[1].slice(0, 4);
    
    const numParts = cleaned.split('.');
    numParts[0] = parseInt(numParts[0] || '0', 10).toLocaleString('en-US');
    setAmountStr(numParts.join('.'));
  }

  const handleSwap = () => {
    setFromAssetId(toAssetId)
    setToAssetId(fromAssetId)
    setAmountStr("")
  }

  const rawAmountNum = parseFloat(amountStr.replace(/,/g, '') || "0");
  const fromPriceIqd = pricesInIqd[fromAssetId as keyof typeof pricesInIqd];
  const toPriceIqd = pricesInIqd[toAssetId as keyof typeof pricesInIqd];
  
  const convertedAmount = (rawAmountNum * fromPriceIqd) / toPriceIqd;

  const formattedOutput = convertedAmount > 0 
    ? convertedAmount.toLocaleString('en-US', { maximumFractionDigits: convertedAmount < 100 ? 3 : 0 }) 
    : "0";

  const presets = fromAssetId === 'iqd' ? [100000, 500000, 1000000, 5000000] : 
                  fromAssetId === 'usd' ? [100, 500, 1000, 10000] :
                  fromAssetId === 'eur' ? [100, 500, 1000] :
                  [1, 5, 10, 50];

  const setPreset = (val: number) => setAmountStr(val.toLocaleString('en-US'))

  const formatIraqiTerms = (num: number, assetId: string) => {
    if (num === 0) return "";
    if (assetId === 'usd') {
      if (num >= 10000) return `(${(num / 10000).toFixed(2)} دفتر) ≡ (${(num / 100).toFixed(2)} ورقة)`;
      if (num >= 100) return `(${(num / 100).toFixed(2)} ورقة)`;
    } else if (assetId === 'iqd') {
      if (num >= 1e9) return `(${(num / 1e9).toFixed(2).replace(/\.00$/, '')} مليار)`;
      if (num >= 1e6) return `(${(num / 1e6).toFixed(2).replace(/\.00$/, '')} مليون)`;
      if (num >= 1e3) return `(${(num / 1e3).toFixed(2).replace(/\.00$/, '')} ألف)`;
    }
    return "";
  }

  const fromAsset = ASSETS.find(a => a.id === fromAssetId) || ASSETS[0];
  const toAsset = ASSETS.find(a => a.id === toAssetId) || ASSETS[0];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10 px-2 sm:px-0">
      
      {/* Header */}
      <div className="text-center pt-4 pb-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">المحول المالي</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">حسابات دقيقة بناءً على الأسعار الحية</p>
      </div>

      {/* Main Calculator Body */}
      <div className="relative">
        <div className="space-y-4">
          
          {/* FROM SECTION */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative z-20">
            <CustomDropdown 
              label="الكمية التي لديك"
              selected={fromAssetId} 
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
                className="w-full bg-transparent text-4xl font-black font-mono text-slate-900 dark:text-white outline-none placeholder-slate-300 dark:placeholder-slate-700 tracking-tight"
                dir="ltr"
              />
            </div>
            
            <div className="min-h-[24px] mt-2 text-left" dir="ltr">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm tracking-wide">
                {formatIraqiTerms(rawAmountNum, fromAssetId)}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-4">
              {presets.map(p => (
                <button 
                  key={p} 
                  onClick={() => setPreset(p)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-xl text-sm font-mono font-bold transition-colors shadow-sm"
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <button 
              onClick={handleSwap}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg shadow-blue-500/30 transform hover:scale-110 transition-all duration-300 flex items-center justify-center border-4 border-slate-50 dark:border-slate-950"
            >
              <ArrowDownUp className="w-6 h-6" />
            </button>
          </div>

          {/* TO SECTION */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative z-10 overflow-hidden">
            <div className="relative z-10">
              <CustomDropdown 
                label="الكمية التي ستحصل عليها"
                selected={toAssetId} 
                onSelect={setToAssetId} 
                isOpen={isToDropdownOpen} 
                setIsOpen={(val: boolean) => { setIsToDropdownOpen(val); setIsFromDropdownOpen(false); }} 
              />

              <div className="mt-6 text-4xl font-black font-mono text-blue-600 dark:text-blue-400 tracking-tight break-all">
                {isLoading ? <span className="animate-pulse opacity-50">...</span> : formattedOutput}
              </div>
              
              <div className="min-h-[24px] mt-2 text-left" dir="ltr">
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

        <div className="mt-8 text-center text-xs font-medium text-slate-400 dark:text-slate-500 p-4">
          الأسعار تُحدَّث تلقائياً من بورصة الكفاح وأسواق المعادن العالمية
        </div>

      </div>
    </div>
  )
}
