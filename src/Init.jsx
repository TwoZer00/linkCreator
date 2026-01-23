import { Backdrop, createTheme, CssBaseline, LinearProgress, Stack, ThemeProvider } from '@mui/material'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { getUserFromId } from './firebase/utils'
import { useTheme } from '@emotion/react'

export default function Init () {
  // const [data, setData] = useState({})
  const theme = createTheme(
    {
      palette: {
        info: {
          main: '#888888ff'
        }
      }
    }
  )
  // useEffect(() => {
  //     onAuthStateChanged(getAuth(), async(user) => {
  //         if (!user) {
  //             setData({})
  //         }
  //         else if(user.uid){
  //             const userData = await getUserFromId(user.uid)
  //             setData(
  //                 (value)=>{
  //                     return {...value,user:userData}
  //                 }
  //             )
  //         }
  //     })
  //     return () => { }
  // },[])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Outlet />
      {/* <Stack direction={'column'} width={"100dvw"} height={"100dvh"}> */}
      {/* {data?.loading && <LinearProgress variant="query" sx={{ position: "fixed", left: 0, zIndex: (theme) => theme.zIndex.drawer + 1, width: "100%" }} />} */}
      {/* </Stack>
            <Backdrop */}
      {/* sx={{ bgcolor: "rgba(255,255,255,0.5)" }}
                open={data?.loading || false}
            > */}
      {/* </Backdrop> */}
    </ThemeProvider>
  )
}
