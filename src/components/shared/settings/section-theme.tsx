'use client'

import { toast } from 'sonner'
import type { SettingsSectionProps } from './types'

export function ThemeSection({ appSettings, patchSettings, inputClass }: SettingsSectionProps) {
  const themeMode = appSettings.themeMode || 'dark'

  const applyThemeMode = (mode: 'dark' | 'light') => {
    patchSettings({ themeMode: mode })
    localStorage.setItem('sc_theme_mode', mode)
    
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(mode)
    root.setAttribute('data-theme', mode)
    
    toast.success(`Theme: ${mode === 'light' ? '☀️ Light' : '🌙 Dark'}`)
  }

  return (
    <div className="mb-10">
      <h3 className="font-display text-[12px] font-600 text-text-2 uppercase tracking-[0.08em] mb-2">
        Theme
      </h3>
      <p className="text-[12px] text-text-3 mb-5">
        Switch between dark and light mode.
      </p>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-[12px] text-text-2 shrink-0">Mode</span>
        <div className="flex rounded-md border border-white/10 overflow-hidden">
          <button
            onClick={() => applyThemeMode('dark')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              themeMode === 'dark'
                ? 'bg-accent text-accent-foreground'
                : 'text-text-3 hover:text-text hover:bg-white/5'
            }`}
          >
            🌙 Dark
          </button>
          <button
            onClick={() => applyThemeMode('light')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              themeMode === 'light'
                ? 'bg-accent text-accent-foreground'
                : 'text-text-3 hover:text-text hover:bg-white/5'
            }`}
          >
            ☀️ Light
          </button>
        </div>
      </div>
    </div>
  )
}
