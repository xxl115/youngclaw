'use client'

import { toast } from 'sonner'
import type { SettingsSectionProps } from './types'

export function ThemeSection({ appSettings, patchSettings }: SettingsSectionProps) {
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

      {/* Dark/Light Mode Toggle */}
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

  const applyThemeMode = (mode: 'dark' | 'light') => {
    // Save to settings and localStorage
    patchSettings({ themeMode: mode })
    localStorage.setItem('sc_theme_mode', mode)
    
    const root = document.documentElement
    
    // Toggle class - remove both first, then add the right one
    root.classList.remove('dark', 'light')
    root.classList.add(mode)
    
    // Also set data attribute for any CSS that uses [data-theme]
    root.setAttribute('data-theme', mode)
    
    toast.success(`Theme: ${mode === 'light' ? '☀️ Light' : '🌙 Dark'}`)
  }

  const handleCustomChange = (value: string) => {
    setCustomHex(value)
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      applyHue(value)
    }
  }

  return (
    <div className="mb-10">
      <h3 className="font-display text-[12px] font-600 text-text-2 uppercase tracking-[0.08em] mb-2">
        Theme
      </h3>
      <p className="text-[12px] text-text-3 mb-5">
        Shift the UI color palette. Pick a preset or enter a custom hex color.
      </p>

      {/* Dark/Light Mode Toggle */}
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

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-3 mb-4">
        {PRESETS.map((preset) => {
          const isActive = currentHue === preset.color && !customHex
          return (
            <button
              key={preset.color}
              onClick={() => { setCustomHex(''); applyHue(preset.color) }}
              className={`group flex flex-col items-center gap-1.5 cursor-pointer bg-transparent border-none p-0`}
              title={preset.label}
            >
              <div
                className={`w-9 h-9 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'ring-2 ring-accent-bright ring-offset-2 ring-offset-bg scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: preset.color }}
              />
              <span className={`text-[10px] font-500 ${isActive ? 'text-text' : 'text-text-3'}`}>
                {preset.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Custom color picker + hex input */}
      <div className="flex items-center gap-3">
        <label className="text-[12px] text-text-3 shrink-0">Custom</label>
        <div className="relative shrink-0">
          <input
            type="color"
            value={customHex || currentHue}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-9 h-9 rounded-full cursor-pointer border-2 border-white/[0.1] bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none"
            title="Pick a custom color"
          />
        </div>
        <input
          type="text"
          value={customHex}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="#2a1f3d"
          maxLength={7}
          className={`${inputClass} max-w-[120px] font-mono`}
          style={{ fontFamily: 'inherit' }}
        />
      </div>
    </div>
  )
}
