import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('dark')
  const systemTheme = ref<'dark' | 'light'>('dark')

  // 检测系统主题
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      systemTheme.value = isDark ? 'dark' : 'light'
    }
  }

  // 应用主题
  const applyTheme = (theme: 'dark' | 'light') => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }

  // 设置主题
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem('preferred-theme', theme)

    if (theme === 'auto') {
      applyTheme(systemTheme.value)
    } else {
      applyTheme(theme)
    }
  }

  // 加载主题
  const loadTheme = () => {
    detectSystemTheme()

    const saved = localStorage.getItem('preferred-theme') as Theme
    if (saved && ['dark', 'light', 'auto'].includes(saved)) {
      setTheme(saved)
    } else {
      setTheme('dark')
    }
  }

  // 监听系统主题变化
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      systemTheme.value = e.matches ? 'dark' : 'light'
      if (currentTheme.value === 'auto') {
        applyTheme(systemTheme.value)
      }
    })
  }

  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    if (newTheme === 'auto') {
      applyTheme(systemTheme.value)
    } else {
      applyTheme(newTheme)
    }
  })

  return {
    currentTheme,
    systemTheme,
    setTheme,
    loadTheme
  }
})
