import { ThemeProvider } from '@emotion/react';
import { Ballot, Favorite, Home, List, ListAlt, LocationOn, Person, Restore } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction, Box, CssBaseline, Paper, Stack, createTheme } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLoaderData, useLocation, useMatch, useMatches, useOutletContext } from 'react-router-dom';
import { label } from '../../locales/locale';

export default function Dashboard() {
    const theme = createTheme();
    const location = useLocation();
    const [data, setData] = useOutletContext();
    
    const PAGES = {
        "dashboard": 0,
        "links": 1,
        "profile": 2,
    }
    const [value, setValue] = useState(PAGES[location.pathname.substring(location.pathname.lastIndexOf("/") + 1)]);

    useEffect(() => {
        setValue(PAGES[location.pathname.substring(location.pathname.lastIndexOf("/") + 1)]);
    }, [location])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box height={"100%"} maxHeight={"100dvh"} mx={"auto"} width={"100%"} maxWidth={"lg"} overflow={"hidden"} p={1} pb={4}>
                <Outlet context={[data, setData]} />
            </Box>
            <Paper sx={{position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 1, backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(64px)" }} elevation={3} >
                    <BottomNavigation
                        showLabels
                        sx={{ backgroundColor: "transparent" }}
                        value={value}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                    >
                        <BottomNavigationAction LinkComponent={Link} to={"."} relative="path" label={label("home")} icon={<Home />} sx={{
                            "& .MuiBottomNavigationAction-label": {
                                ":first-letter": { textTransform: "uppercase" }
                            }
                        }} />
                        <BottomNavigationAction LinkComponent={Link} to={"links"} label={label("links")} icon={<Ballot />} sx={{
                            "& .MuiBottomNavigationAction-label": {
                                ":first-letter": { textTransform: "uppercase" }
                            }
                        }} />
                        <BottomNavigationAction LinkComponent={Link} to={"profile"} label={label("profile")} sx={{
                            "& .MuiBottomNavigationAction-label": {
                                ":first-letter": { textTransform: "uppercase" }
                            }
                        }} icon={<Person />} />
                    </BottomNavigation>
            </Paper>
        </ThemeProvider>
    )
}
