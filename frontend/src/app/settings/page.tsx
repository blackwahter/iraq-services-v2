"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Settings, Bell, Moon, Sun, Monitor, RefreshCw, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useSettings } from "@/components/settings-provider"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings } = useSettings()
  const [mounted, setMounted] = useState(false)
  const [cleared, setCleared] = useState(false)

  // Ensure hydration matches for next-themes
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleClearCache = () => {
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const SettingSection = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10 px-4 sm:px-0">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/80 dark:to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-100/50 dark:border-white/10 shadow-lg text-center md:text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">الإعدادات</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg font-medium">التحكم المركزي بمظهر التطبيق والإشعارات</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Appearance Settings */}
        <SettingSection title="المظهر العام (السمة)" icon={Sun}>
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                theme === 'light' 
                ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm' 
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Sun className="w-8 h-8" />
              <span className="font-bold">الوضع النهاري (فاتح)</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                theme === 'dark' 
                ? 'border-blue-500 bg-blue-900/20 text-blue-400 shadow-sm' 
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Moon className="w-8 h-8" />
              <span className="font-bold">الوضع الليلي (داكن)</span>
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`flex-1 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                theme === 'system' 
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Monitor className="w-8 h-8" />
              <span className="font-bold">حسب نظام الجهاز</span>
            </button>
          </div>
        </SettingSection>

        {/* Notifications Settings */}
        <SettingSection title="إعدادات الإشعارات" icon={Bell}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">إشعارات الرواتب العاجلة</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">تنبيه فوري عند صدور أخبار تمويل أو توزيع الرواتب</div>
              </div>
              <Toggle 
                enabled={notifications.salaries} 
                onChange={() => setNotifications(prev => ({...prev, salaries: !prev.salaries}))} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">إشعارات قفزات البورصة</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">تنبيه عند التغيرات المفاجئة والكبيرة في سعر الدولار</div>
              </div>
              <Toggle 
                enabled={notifications.bourses} 
                onChange={() => setNotifications(prev => ({...prev, bourses: !prev.bourses}))} 
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">إشعارات المعادن والنفط</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">تنبيه يومي بأسعار الذهب والفضة والنفط عالمياً</div>
              </div>
              <Toggle 
                enabled={notifications.metals} 
                onChange={() => setNotifications(prev => ({...prev, metals: !prev.metals}))} 
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">صوت التنبيهات</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">تشغيل تأثير صوتي عند وصول إشعار جديد</div>
              </div>
              <Toggle 
                enabled={notifications.sound} 
                onChange={() => setNotifications(prev => ({...prev, sound: !prev.sound}))} 
              />
            </div>
          </div>
        </SettingSection>

        {/* Data & Preferences */}
        <SettingSection title="البيانات والتفضيلات" icon={RefreshCw}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">معدل التحديث التلقائي بالخلفية</label>
              <select 
                value={refreshRate}
                onChange={(e) => setRefreshRate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="15s">سريع جداً (كل 15 ثانية)</option>
                <option value="30s">طبيعي (كل 30 ثانية) - موصى به</option>
                <option value="60s">بطيء (كل دقيقة) - لتوفير البطارية</option>
                <option value="manual">يدوي فقط (لا يوجد تحديث تلقائي)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">البورصة الافتراضية للأسعار</label>
              <select 
                value={defaultBourse}
                onChange={(e) => setDefaultBourse(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kifah">بغداد - بورصة الكفاح</option>
                <option value="harthiya">بغداد - بورصة الحارثية</option>
                <option value="erbil">بورصة أربيل</option>
                <option value="basra">بورصة البصرة</option>
              </select>
            </div>
          </div>
        </SettingSection>

        {/* App Info & Cache */}
        <SettingSection title="عن التطبيق والصيانة" icon={ShieldCheck}>
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div className="text-center md:text-right mb-4 md:mb-0">
              <div className="font-bold text-lg text-slate-800 dark:text-white">بوابة العراق المالية</div>
              <div className="text-slate-500 dark:text-slate-400 mt-1">الإصدار 2.0.0 (النسخة المستقرة)</div>
            </div>
            
            <button 
              onClick={handleClearCache}
              disabled={cleared}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                cleared 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50'
              }`}
            >
              {cleared ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تم المسح والتسريع</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>مسح الذاكرة المؤقتة (Cache)</span>
                </>
              )}
            </button>
          </div>
        </SettingSection>

      </div>
    </div>
  )
}
