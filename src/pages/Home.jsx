import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { AccountCircle, Menu as MenuIcon, More, Search } from '@mui/icons-material'
import { AppBar, Box, Button, CssBaseline, IconButton, Menu, MenuItem, Paper, Slide, Stack, Toolbar, Typography, useScrollTrigger } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth';
import { label } from '../locales/locale';
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    // Override media queries injected by theme.mixins.toolbar
    '@media all': {
        minHeight: 128,
    },
}));
const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);
export default function Home() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [auth, setAuth] = useState(getAuth());
    const navigate = useNavigate();
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        if (getAuth().currentUser) {
            setAuth(getAuth());
        }
    }, [getAuth().currentUser]);
    return (
        <Box width={"100%"} height={"100%"} mx={"auto"} >
            <CssBaseline />
            <Stack height={"100%"} justifyContent={"center"} alignItems={"center"} >
                <Box textAlign={"center"} maxWidth={300}>
                    <Typography variant="h1" fontSize={45}>
                        linkCreator
                    </Typography>
                    <Typography variant="h5" fontSize={15}>
                        {label("home-subtitle")}
                    </Typography>
                    <Stack direction={"row"} justifyContent={"space-around"} mt={2}>
                        <Button variant="contained" onClick={() => navigate("/login")}>
                            {label("login")}
                        </Button>
                        <Button variant="contained" onClick={() => navigate("/register")}>
                            {label("register")}
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    )
}


function HideOnScroll(props) {
    const { children, window } = props;
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
    });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

HideOnScroll.propTypes = {
    children: PropTypes.element.isRequired,
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window: PropTypes.func,
};
