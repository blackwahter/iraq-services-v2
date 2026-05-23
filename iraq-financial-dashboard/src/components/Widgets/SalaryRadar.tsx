"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_MINISTRIES = [
  "وزارة التربية", "وزارة الصحة", "وزارة الدفاع", "وزارة الداخلية",
  "وزارة التعليم العالي", "وزارة النفط", "وزارة الكهرباء", "وزارة المالية",
  "وزارة التخطيط", "وزارة العدل"
];

const generateMockData = () => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    ministry: MOCK_MINISTRIES[Math.floor(Math.random() * MOCK_MINISTRIES.length)],
    status: Math.random() > 0.4 ? "funded" : "auditing",
    amount: (Math.random() * 50 + 10).toFixed(1) + " مليار",
    time: "الآن",
  }));
};

export function SalaryRadar() {
  const [data, setData] = useState(generateMockData());
  const [stats, setStats] = useState({ funded: 68, pending: 32 });

  // Simulate WebSocket updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev];
        newData.pop();
        newData.unshift({
          id: Math.random(),
          ministry: MOCK_MINISTRIES[Math.floor(Math.random() * MOCK_MINISTRIES.length)],
          status: Math.random() > 0.3 ? "funded" : "auditing",
          amount: (Math.random() * 50 + 10).toFixed(1) + " مليار",
          time: "الآن",
        });
        return newData;
      });
      
      // Randomize stats slightly for life
      setStats(prev => ({
        funded: Math.min(100, Math.max(0, prev.funded + (Math.random() > 0.5 ? 1 : -1))),
        pending: Math.min(100, Math.max(0, prev.pending + (Math.random() > 0.5 ? -1 : 1))),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: "تم التمويل", value: stats.funded, color: "#10B981" },
    { name: "قيد التدقيق", value: stats.pending, color: "#F59E0B" }
  ];

  return (
    <div className="glass-panel p-6 flex flex-col h-full h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            رصد الرواتب المباشر
          </h2>
          <p className="text-sm text-slate-400 mt-1">تحديث حي لحظي للتمويل</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        {/* Ring Chart */}
        <div className="w-full lg:w-1/3 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/5 relative p-4">
          <div className="h-[200px] w-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  stroke="none"
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050B14', borderColor: '#10B981', borderRadius: '12px', color: '#fff', direction: 'rtl' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                {stats.funded}%
              </span>
              <span className="text-xs text-slate-400">إنجاز اليوم</span>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4 w-full justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-300">مكتمل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold-glowing" />
              <span className="text-sm text-slate-300">تدقيق</span>
            </div>
          </div>
        </div>

        {/* Scrolling Table */}
        <div className="w-full lg:w-2/3 h-full overflow-hidden relative rounded-xl bg-white/5 border border-white/5">
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-obsidian/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-obsidian/80 to-transparent z-10 pointer-events-none" />
          
          <div className="p-4 h-full overflow-y-auto hide-scrollbar space-y-3">
            {data.map((item, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">{item.ministry}</span>
                  <span className="text-xs text-slate-400 mt-1">{item.amount}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border",
                    item.status === "funded" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  )}>
                    {item.status === "funded" ? (
                      <><CheckCircle2 className="w-3 h-3" /> تم التمويل</>
                    ) : (
                      <><Clock className="w-3 h-3 animate-spin-slow" /> قيد التدقيق</>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{item.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
