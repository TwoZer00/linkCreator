import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { ThemeContextProvider, useTheme } from './contexts/ThemeContext'

function AppContent() {
  const { darkMode } = useTheme()
  
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#009688',
        light: '#52c7b8',
        dark: '#00675b'
      },
      info: {
        main: '#888888ff'
      }
    }
  })
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Outlet />
    </ThemeProvider>
  )
}

export default function Init() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  )
}
