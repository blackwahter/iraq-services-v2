"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface Settings {
  refreshRate: number; // in milliseconds (e.g., 30000)
  defaultBourse: string; // 'kifah', 'harthiya', 'erbil', 'basra'
  notificationsType: 'all' | 'favorites' | 'none';
  notificationsSound: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  refreshRate: 30000,
  defaultBourse: 'kifah',
  notificationsType: 'favorites',
  notificationsSound: true,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load from local storage
    const stored = localStorage.getItem('iraq-portal-settings')
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse settings", e)
      }
    }
    setMounted(true)
  }, [])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('iraq-portal-settings', JSON.stringify(updated))
      return updated
    })
  }

  // Prevent hydration mismatch by not rendering children until mounted if they depend on context deeply,
  // but since we want fast loading, we'll provide default settings immediately and update after mount.
  // Actually, returning children immediately with defaultSettings is fine for SEO/SSR.
  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
