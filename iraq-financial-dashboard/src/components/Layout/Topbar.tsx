"use client";

import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import { useEffect, useState } from "react";

export function Topbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled ? "py-4" : "py-6"
      }`}
    >
      <div className="px-6 lg:px-10 flex items-center justify-between">
        {/* Search / Command Palette Trigger */}
        <button 
          className="glass-panel glass-panel-interactive flex items-center gap-3 px-4 py-2.5 w-64 lg:w-96 text-slate-400 group"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
        >
          <Search className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
          <span className="text-sm font-medium">بحث (Ctrl + K)...</span>
          <div className="mr-auto flex gap-1">
            <kbd className="bg-white/10 px-2 py-1 rounded text-xs">Ctrl</kbd>
            <kbd className="bg-white/10 px-2 py-1 rounded text-xs">K</kbd>
          </div>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <button className="glass-panel p-2.5 text-slate-300 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          </button>
          
          <div className="glass-panel p-1 flex items-center gap-3 pr-4 cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">المدير العام</span>
              <span className="text-xs text-slate-400">مسؤول النظام</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
