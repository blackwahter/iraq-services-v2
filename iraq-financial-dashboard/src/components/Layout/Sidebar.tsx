"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Wallet, TrendingUp, Settings, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "لوحة القيادة", icon: LayoutDashboard, href: "#" },
  { name: "الرواتب", icon: Wallet, href: "#" },
  { name: "البورصة", icon: TrendingUp, href: "#" },
  { name: "الإعدادات", icon: Settings, href: "#" },
];

export function Sidebar() {
  const [active, setActive] = useState("لوحة القيادة");

  return (
    <motion.aside 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed right-0 top-0 h-screen w-64 glass-panel border-r-0 border-y-0 rounded-none z-40 hidden lg:flex flex-col"
    >
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <TrendingUp className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-white to-slate-400">
          بوابة العراق
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.name;
          return (
            <Link 
              key={item.name}
              href={item.href}
              onClick={(e) => { e.preventDefault(); setActive(item.name); }}
              className="relative block"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "")} />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <button className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors w-full px-4 py-3 rounded-xl hover:bg-red-500/10">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </motion.aside>
  );
}
