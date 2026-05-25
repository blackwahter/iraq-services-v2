export default function MetalsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">الذهب والفضة</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        هذه الصفحة قيد الإنشاء. بانتظار ربط واجهة برمجة التطبيقات (API) لعرض الأسعار الحية للمعادن الثمينة.
      </p>
    </div>
  )
}
