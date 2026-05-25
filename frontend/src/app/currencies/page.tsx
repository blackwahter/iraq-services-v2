export default function CurrenciesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">العملات الأجنبية</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        هذه الصفحة قيد الإنشاء. يمكنك ملء محتواها لاحقاً لتعرض أسعار صرف العملات الأجنبية مقابل الدينار.
      </p>
    </div>
  )
}
