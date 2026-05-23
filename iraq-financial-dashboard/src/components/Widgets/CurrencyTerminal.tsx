"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, ISeriesApi } from "lightweight-charts";
import { TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Generate mock candlestick data
const generateData = () => {
  let initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  initialDate.setDate(initialDate.getDate() - 60);

  let data = [];
  let currentPrice = 148000;

  for (let i = 0; i < 60; i++) {
    const open = currentPrice + (Math.random() - 0.5) * 1000;
    const high = open + Math.random() * 500;
    const low = open - Math.random() * 500;
    const close = Math.random() > 0.5 ? high - Math.random() * 200 : low + Math.random() * 200;
    
    data.push({
      time: initialDate.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
    });
    
    currentPrice = close;
    initialDate.setDate(initialDate.getDate() + 1);
  }
  return data;
};

export function CurrencyTerminal() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [data, setData] = useState(generateData());
  const [currentKifah, setCurrentKifah] = useState(151500);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    seriesRef.current?.setData(data);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.remove();
    };
  }, [data]);

  // Simulate real-time tick
  useEffect(() => {
    const interval = setInterval(() => {
      const lastTick = data[data.length - 1];
      const newClose = lastTick.close + (Math.random() - 0.5) * 200;
      const newHigh = Math.max(lastTick.high, newClose);
      const newLow = Math.min(lastTick.low, newClose);

      const update = {
        time: lastTick.time,
        open: lastTick.open,
        high: newHigh,
        low: newLow,
        close: newClose,
      };

      seriesRef.current?.update(update);
      setCurrentKifah(Math.round(newClose));
    }, 2000);

    return () => clearInterval(interval);
  }, [data]);

  return (
    <div className="glass-panel p-6 flex flex-col h-full relative overflow-hidden">
      {/* Ticker Tape */}
      <div className="absolute top-0 left-0 right-0 h-1 border-b border-white/10 overflow-hidden bg-obsidian-light">
        <div className="flex w-[200%] animate-ticker opacity-50">
           <div className="flex-1 text-[10px] text-emerald-500 font-mono whitespace-nowrap">IQD/USD 151,500 ▲</div>
           <div className="flex-1 text-[10px] text-red-500 font-mono whitespace-nowrap">EUR/USD 1.08 ▼</div>
           <div className="flex-1 text-[10px] text-emerald-500 font-mono whitespace-nowrap">GBP/USD 1.25 ▲</div>
        </div>
      </div>

      <div className="flex justify-between items-start mb-6 mt-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            محطة العملات المتقدمة
          </h2>
          <div className="flex items-end gap-3 mt-2">
            <span className="text-3xl font-bold text-emerald-400 glow-text-green font-mono">
              {currentKifah.toLocaleString()}
            </span>
            <span className="text-sm text-slate-400 mb-1">IQD / 100 USD</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <RefreshCcw className="w-4 h-4 animate-spin-slow" />
          <span className="text-xs font-bold">مباشر</span>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full flex-1 min-h-[300px] bg-obsidian-light/30 rounded-xl border border-white/5 relative" />

      {/* Local Bourses Depth */}
      <div className="flex gap-4 mt-6">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center glass-panel-interactive cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm text-slate-400">بورصة الكفاح</span>
            <span className="font-bold text-lg text-white">{currentKifah.toLocaleString()}</span>
          </div>
          <TrendingUp className="text-emerald-500 w-6 h-6" />
        </div>
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center glass-panel-interactive cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm text-slate-400">بورصة الحارثية</span>
            <span className="font-bold text-lg text-white">{(currentKifah + 50).toLocaleString()}</span>
          </div>
          <TrendingUp className="text-emerald-500 w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
