"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Globe, MapPin } from "lucide-react";

interface CommodityProps {
  title: string;
  price: string;
  trend: string;
  premium?: string;
  isUp: boolean;
}

function CommodityCard({ title, price, trend, premium, isUp }: CommodityProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-32 cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden glass-panel p-4 flex flex-col justify-between border-t border-t-white/10">
          <div className="flex justify-between items-start">
            <span className="text-slate-300 font-medium">{title}</span>
            <div className={`text-xs px-2 py-1 rounded-full ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {trend}
            </div>
          </div>
          <div className="text-2xl font-bold text-white glow-text-gold tracking-tight">{price}</div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden glass-panel p-4 flex flex-col justify-between border-t border-t-gold-glowing/30 [transform:rotateY(180deg)] bg-gradient-to-br from-obsidian to-obsidian-light">
          <div className="text-xs text-slate-400 flex justify-between">
            <span>24h Trend</span>
            <span className="text-emerald-400">Stable</span>
          </div>
          {/* Fake mini sparkline CSS */}
          <div className="h-8 w-full flex items-end gap-1 opacity-50 mt-2">
            {[40, 60, 45, 80, 50, 70, 90, 85].map((h, i) => (
              <motion.div 
                key={i} 
                className="flex-1 bg-gold-glowing rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${isFlipped ? h : 0}%` }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              />
            ))}
          </div>
          {premium && (
            <div className="flex items-center gap-2 text-xs mt-2 border-t border-white/5 pt-2">
              <span className="text-slate-500">Global Premium:</span>
              <span className="text-emerald-400 font-bold">{premium}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function CommoditiesPanel() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="glass-panel p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold-glowing animate-pulse" />
            المعادن الثمينة
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CommodityCard title="ذهب عيار 24" price="112,000 د.ع" trend="+0.5%" isUp={true} premium="+1.2%" />
          <CommodityCard title="ذهب عيار 21" price="98,000 د.ع" trend="+0.3%" isUp={true} />
        </div>
      </div>

      <div className="glass-panel p-5 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            النفط والمؤشرات
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CommodityCard title="خام برنت" price="$84.50" trend="-1.2%" isUp={false} />
          <CommodityCard title="الخام الأمريكي" price="$80.20" trend="-1.5%" isUp={false} />
        </div>
      </div>
    </div>
  );
}
