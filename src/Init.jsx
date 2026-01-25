import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { Outlet } from 'react-router-dom'

export default function Init () {
  const theme = createTheme(
    {
      palette: {
        primary: {
          main: '#009688',
          light: '#52c7b8',
          dark: '#00675b'
        },
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
