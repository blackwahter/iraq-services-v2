"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, TrendingUp, X } from "lucide-react";

const MOCK_SEARCH_RESULTS = [
  { id: 1, title: "وزارة التربية", type: "راتب", icon: Building2 },
  { id: 2, title: "سعر صرف الدولار (موازي)", type: "عملة", icon: TrendingUp },
  { id: 3, title: "وزارة الصحة", type: "راتب", icon: Building2 },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-obsidian border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-emerald-400 mr-3" />
              <input
                autoFocus
                type="text"
                placeholder="ابحث عن وزارة، عملة، أو أداة..."
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-500 mr-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-2 max-h-[400px] overflow-y-auto">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 mb-1">النتائج المقترحة</div>
              {MOCK_SEARCH_RESULTS.filter(r => r.title.includes(query)).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                      <result.icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                    </div>
                    <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{result.title}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-slate-400">{result.type}</span>
                </div>
              ))}
              
              {MOCK_SEARCH_RESULTS.filter(r => r.title.includes(query)).length === 0 && (
                <div className="py-10 text-center text-slate-500">
                  لا توجد نتائج مطابقة لـ "{query}"
                </div>
              )}
            </div>
            
            <div className="bg-white/5 px-4 py-3 text-xs text-slate-500 flex justify-between items-center border-t border-white/5">
              <div className="flex gap-4">
                <span>استخدم <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">↑</kbd> <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">↓</kbd> للتنقل</span>
                <span>استخدم <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> للاختيار</span>
              </div>
              <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> للإغلاق</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
