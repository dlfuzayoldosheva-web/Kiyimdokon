import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('montanoTheme')
    return saved === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    const body = document.body
    if (theme === 'dark') {
      body.classList.add('dark')
      body.classList.remove('light')
    } else {
      body.classList.add('light')
      body.classList.remove('dark')
    }
    localStorage.setItem('montanoTheme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)