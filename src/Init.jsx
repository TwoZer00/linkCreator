import { Backdrop, Box, LinearProgress, Stack } from '@mui/material'
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'

export default function Init() {
    const [data, setData] = useState({})
    return (
        <>
            <Stack direction={'column'}>
                {data?.loading && <LinearProgress variant="query" sx={{ position: "fixed", zIndex: (theme) => theme.zIndex.drawer + 1, width: "100%" }} />}
                <Outlet context={[data, setData]} />
            </Stack>
            <Backdrop
                sx={{ bgcolor: "rgba(255,255,255,0.5)" }}
                open={data?.loading || false}
            >
            </Backdrop>
        </>
    )
}
