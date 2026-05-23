"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

// Odometer single digit component
function Digit({ value }: { value: string }) {
  return (
    <div className="relative h-[40px] w-[24px] overflow-hidden leading-[40px] text-center font-mono">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Odometer({ value }: { value: string }) {
  return (
    <div className="flex">
      {value.split('').map((char, i) => (
        char >= '0' && char <= '9' ? 
          <Digit key={`${i}-${char}`} value={char} /> : 
          <span key={i} className="h-[40px] leading-[40px] font-mono">{char}</span>
      ))}
    </div>
  );
}

export function FinancialConverter() {
  const [amount, setAmount] = useState<string>("100");
  const [iqdValue, setIqdValue] = useState<string>("151,500");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!isNaN(num)) {
      const result = num * 1515; // 151,500 per 100 USD
      setIqdValue(result.toLocaleString('en-US'));
    } else {
      setIqdValue("0");
    }
  }, [amount]);

  return (
    <div className="glass-panel p-6 flex flex-col h-full relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

      <h2 className="text-xl font-bold text-white mb-6">المحول الذكي</h2>

      <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
        {/* From */}
        <div className="relative">
          <label className="text-xs text-slate-400 mb-2 block">المبلغ (USD)</label>
          <div className={`flex items-center bg-obsidian-light/50 border rounded-xl overflow-hidden transition-colors duration-300 ${isFocused ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/10'}`}>
            <div className="px-4 py-3 bg-white/5 border-l border-white/5 font-bold text-slate-300">
              USD 🇺🇸
            </div>
            <input 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 bg-transparent px-4 py-3 text-white font-mono text-xl outline-none"
              placeholder="0"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-20">
          <button className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all hover:scale-110 active:scale-95 shadow-lg">
            <ArrowLeftRight className="w-4 h-4 rotate-90" />
          </button>
        </div>

        {/* To */}
        <div className="relative">
          <label className="text-xs text-slate-400 mb-2 block">النتيجة (IQD)</label>
          <div className="flex items-center bg-obsidian-light/50 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-white/5 border-l border-white/5 font-bold text-slate-300">
              IQD 🇮🇶
            </div>
            <div className="flex-1 px-4 py-3 text-emerald-400 font-bold text-2xl drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center">
              <Odometer value={iqdValue} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs text-slate-500">
        يعتمد على سعر الصرف الموازي المباشر
      </div>
    </div>
  );
}
