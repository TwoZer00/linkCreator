import { Ballot, Home, Person } from '@mui/icons-material'
import { Backdrop, BottomNavigation, BottomNavigationAction, Box, LinearProgress, Paper, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { label } from '../../locales/locale'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getUserFromId } from '../../firebase/utils'

export default function Dashboard () {
  const location = useLocation()
  const [data, setData] = useState({})

  const PAGES = {
    dashboard: 0,
    links: 1,
    profile: 2
  }
  const [value, setValue] = useState(PAGES[location.pathname.substring(location.pathname.lastIndexOf('/') + 1)])

  useEffect(() => {
    setValue(PAGES[location.pathname.substring(location.pathname.lastIndexOf('/') + 1)])
  }, [location])

  useEffect(() => {
    onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        setData({})
      } else if (user.uid) {
        const userData = await getUserFromId(user.uid)
        setData(
          (value) => {
            return { ...value, user: userData }
          }
        )
      }
    })
    return () => { }
  }, [])

  return (
    <Stack direction='column' height='100dvh'>
      <Box flex={1} p={1}>
        <Outlet context={[data, setData]} />
      </Box>
      <Paper sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(64px)' }} elevation={3}>
        <BottomNavigation
          showLabels
          sx={{ backgroundColor: 'transparent' }}
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue)
          }}
        >
          <BottomNavigationAction
            LinkComponent={Link} to='.' relative='path' label={label('home')} icon={<Home />} sx={{
              '& .MuiBottomNavigationAction-label': {
                ':first-letter': { textTransform: 'uppercase' }
              }
            }}
          />
          <BottomNavigationAction
            LinkComponent={Link} to='links' label={label('links')} icon={<Ballot />} sx={{
              '& .MuiBottomNavigationAction-label': {
                ':first-letter': { textTransform: 'uppercase' }
              }
            }}
          />
          <BottomNavigationAction
            LinkComponent={Link} to='profile' label={label('profile')} sx={{
              '& .MuiBottomNavigationAction-label': {
                ':first-letter': { textTransform: 'uppercase' }
              }
            }} icon={<Person />}
          />
        </BottomNavigation>
      </Paper>
      <Backdrop
        sx={{ bgcolor: 'rgba(255,255,255,0.5)' }}
        open={data?.loading || false}
      />
      {data?.loading && <LinearProgress variant='query' sx={{ position: 'fixed', left: 0, zIndex: (theme) => theme.zIndex.drawer + 1, width: '100%' }} />}
    </Stack>
  )
}
