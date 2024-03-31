import { ThemeProvider } from '@emotion/react';
import { Ballot, Favorite, Home, List, ListAlt, LocationOn, Person, Restore } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction, Box, CssBaseline, Paper, Stack, createTheme } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useMatch, useMatches } from 'react-router-dom';

export default function Dashboard() {
    const theme = createTheme();
    const location = useLocation();
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
            <Stack sx={{ flexGrow: 2, height: "100vh" }}>
                <Outlet />
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3} >
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                    >
                        <BottomNavigationAction LinkComponent={Link} to={"."} relative="path" label="Home" icon={<Home />} />
                        <BottomNavigationAction LinkComponent={Link} to={"links"} label="Links" icon={<Ballot />} />
                        <BottomNavigationAction LinkComponent={Link} to={"profile"} label="Profile" icon={<Person />} />
                    </BottomNavigation>
                </Paper>
            </Stack>
        </ThemeProvider>
    )
}
