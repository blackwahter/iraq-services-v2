"use client"

import { useEffect, useState } from "react"
import { Search, Wallet, ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react"

interface PaginationData {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export default function SalariesPage() {
  const [updates, setUpdates] = useState<any[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("الكل")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [truncatableIds, setTruncatableIds] = useState<Set<number>>(new Set())

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch data
  useEffect(() => {
    const fetchUpdates = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      try {
        const filterParam = activeFilter === "الكل" ? "" : activeFilter;
        // Combine text search and filter chip
        let combinedSearch = [];
        if (filterParam) combinedSearch.push(filterParam);
        if (debouncedSearch) combinedSearch.push(debouncedSearch);
        const finalSearch = combinedSearch.join(" ");

        // If user is searching or filtering, get all results (limit=300) like the old system
        const limit = finalSearch ? 300 : 5;
        let url = `/api/updates?category=${encodeURIComponent('رواتب')}&page=${currentPage}&limit=${limit}`;
        
        // Note: the backend uses LIKE '%search%'. If finalSearch is "وزارة داخليه", it might not match.
        // But since the backend is simple, we will just pass the most specific one, or just the text if both exist,
        // Actually, let's just pass them if they type. If they type "داخليه", activeFilter is "الكل", so it sends "داخليه".
        if (finalSearch) {
            url += `&search=${encodeURIComponent(debouncedSearch || filterParam)}`;
        }
        
        const res = await fetch(url)
        const data = await res.json()
        
        if (data.data && Array.isArray(data.data)) {
          setUpdates(data.data)
          setPagination(data.pagination)
        } else if (Array.isArray(data)) {
          setUpdates(data.filter((u: any) => u.category === "رواتب").slice(0, limit))
        }
      } catch (error) {
        console.error("Error fetching salaries:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUpdates(true)
    
    const interval = setInterval(() => fetchUpdates(false), 30000)
    return () => clearInterval(interval)
  }, [currentPage, activeFilter, debouncedSearch])

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  // Check which texts are actually truncated by line-clamp
  useEffect(() => {
    const checkTruncation = () => {
      const elements = document.querySelectorAll('.salary-text-content');
      const newTruncatable = new Set<number>();
      elements.forEach((el) => {
        // Use a 2px tolerance for subpixel rounding differences in some browsers
        // Also ensure the text is at least a certain length to prevent false positives on short sentences
        const textLength = el.textContent?.trim().length || 0;
        if (el.scrollHeight > el.clientHeight + 2 && textLength > 80) {
          const id = el.getAttribute('data-id');
          if (id) newTruncatable.add(Number(id));
        }
      });
      setTruncatableIds(newTruncatable);
    };

    // Small delay to ensure browser has rendered the clamped text
    const timeout = setTimeout(checkTruncation, 150);
    return () => clearTimeout(timeout);
  }, [updates, activeFilter, debouncedSearch]);

  const getVisiblePages = () => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    const current = currentPage;
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (current <= 2) {
      end = Math.min(total, 5);
    }
    if (current >= total - 1) {
      start = Math.max(1, total - 4);
    }

    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // We no longer filter locally because the server does it, but we can leave it or remove it.
  // Actually, let's just use updates directly since the server returns the exact matches.
  const filteredUpdates = updates;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl text-center md:text-right relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/30">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">نظام رصد الرواتب</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">متابعة حية ودقيقة لتمويل وصرف رواتب الموظفين والمتقاعدين</p>
          </div>
        </div>

        <div className="relative max-w-2xl relative z-10">
          <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full pl-4 pr-14 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm dark:text-white font-medium placeholder-slate-400"
            placeholder="بحث في جميع الأخبار..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 relative z-10">
          {["الكل", "وزارة", "متقاعدين", "الرعاية الاجتماعية"].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter)
                setSearchInput("") // Clear text search when clicking a chip
                setCurrentPage(1)
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeFilter === filter 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105 border border-emerald-400"
                  : "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {filter === "وزارة" ? "الوزارات فقط" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-5">
        {isLoading ? (
          // Skeleton Loader
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 animate-pulse h-32"></div>
          ))
        ) : filteredUpdates.length > 0 ? (
          filteredUpdates.map((update) => {
            const isExpanded = expandedIds.has(update.id);
            
            return (
              <div key={update.id} className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden">
                {/* Accent Line */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-r-2xl"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-full text-xs font-bold w-max shadow-sm border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    إشعار عاجل
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md w-max" dir="ltr">
                    {new Date(update.created_at).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'})} - {new Date(update.created_at).toLocaleDateString('ar-IQ')}
                  </span>
                </div>
                
                <div className="relative">
                  <p 
                    className={`salary-text-content text-sm md:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}
                    data-id={update.id}
                  >
                    {update.content}
                  </p>
                  
                  {(truncatableIds.has(update.id) || isExpanded) && (
                    <button 
                      onClick={() => toggleExpand(update.id)}
                      className="mt-2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg text-sm w-max"
                    >
                      {isExpanded ? (
                        <>عرض أقل <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>اقرأ المزيد <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800 text-slate-500 shadow-sm">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium">لا توجد أخبار في هذه الصفحة</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm w-max mx-auto">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 md:p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <div className="flex items-center gap-2 font-mono px-2" dir="ltr">
            {getVisiblePages().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center font-bold rounded-xl transition-all ${
                  currentPage === pageNum 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-110" 
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="p-2 md:p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      )}
    </div>
  )
}
