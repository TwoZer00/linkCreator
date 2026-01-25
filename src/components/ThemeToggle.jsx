import { IconButton } from '@mui/material'
import { DarkMode, LightMode } from '@mui/icons-material'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }}>
      {darkMode ? <LightMode /> : <DarkMode />}
    </IconButton>
  )
}