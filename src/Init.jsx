import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { Outlet } from 'react-router-dom'

export default function Init () {
  const theme = createTheme(
    {
      palette: {
        info: {
          main: '#888888ff'
        }
      }
    }
  )
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Outlet />
    </ThemeProvider>
  )
}
