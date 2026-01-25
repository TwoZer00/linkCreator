import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeContextProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('themeMode')
    return saved || 'system'
  })

  const [systemDarkMode, setSystemDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setSystemDarkMode(e.matches)
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode)
  }, [themeMode])

  const darkMode = themeMode === 'dark' || (themeMode === 'system' && systemDarkMode)

  const setTheme = (mode) => {
    setThemeMode(mode)
  }

  return (
    <ThemeContext.Provider value={{ themeMode, darkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}