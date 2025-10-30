import { ThemeProvider } from '@emotion/react';
import { Backdrop, Box, Button, CssBaseline, FormControl, FormHelperText, InputLabel, LinearProgress, Link, Modal, OutlinedInput, Stack, Typography, createTheme } from '@mui/material';
import React, { useState } from 'react';
import { Link as LinkRouterDom, useNavigate, useOutletContext } from 'react-router-dom';
import { getUserFromId, logEmailPassword } from '../firebase/utils';
import { label } from '../locales/locale';
import { getAuth } from 'firebase/auth';

export default function Login() {
    const theme = createTheme();
    const [error, setError] = useState();
    const navigate = useNavigate();
    const [data, setData] = useOutletContext();
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setData((value) => { return { ...value, loading: true } });
        const form = event.currentTarget;
        const data = new FormData(event.currentTarget);
        const userLogin = {
            email: data.get('email'),
            password: data.get('password'),
        }
        const tempError = {};
        Array.from(form.querySelectorAll('input')).forEach((input) => {
            tempError[input.id] = ""
            if (!input.checkValidity())
                tempError[input.id] = input.validationMessage;
            else
                delete tempError[input.id]
        });
        setError(tempError);
        if (form.checkValidity()) {
            try {
                await logEmailPassword(userLogin);
                navigate('/dashboard', { replace: true });
            } catch (error) {
                error.code === "auth/user-not-found" && setError({ ...error, email: "User not found" });
                error.code === "auth/wrong-password" && setError({ ...error, password: "Wrong password" });
            }
            finally {
                setData((value) => { return { ...value, loading: false } });
            }
        }
        else {
            setData((value) => { return { ...value, loading: false } });
        }
    }
    return (
        <ThemeProvider theme={theme} >
            <CssBaseline />
            <Stack gap={2} component={"form"} onSubmit={handleSubmit} noValidate width={"100%"} height={"100%"} p={1} justifyContent={"center"} alignItems={"center"} >
                <Box textAlign={"center"}>
                    <Typography variant="h1" fontSize={45} sx={{ ":first-letter": { textTransform: "uppercase" } }}>{label("login-opt")}</Typography>
                    <Typography variant="caption" sx={{ ":first-letter": { textTransform: "uppercase" } }} >{label("login-subtitle")}</Typography>
                </Box>
                <CustomInput id="email" label={label("email")} name="email" type="email" error={error?.email} required autoComplete="email" autoFocus={true} />
                <CustomInput id="password" label={label("password")} name="password" type="password" error={error?.password} required autoComplete="current-password" />
                <Button variant="contained" type="submit" fullWidth >{label("login")}</Button>
                <Link component={LinkRouterDom} to={"/register"} variant='body1' textAlign={"center"} sx={{ ":first-letter": { textTransform: "uppercase" } }} >{label("register-here")}</Link>
            </Stack>
        </ThemeProvider>
    )
}

export const CustomInput = ({ id, label, error, ...props }) => {
    return (
        <>
            <FormControl error={Boolean(error)} fullWidth>
                <InputLabel error={Boolean(error)} htmlFor={id} sx={{ ":first-letter": { textTransform: "uppercase" } }} >{label}</InputLabel>
                <OutlinedInput
                    id={id}
                    label={label}
                    error={Boolean(error)}
                    {...props}
                />
                {Boolean(error) && <FormHelperText error={Boolean(error)} id={id} component={Typography} sx={{ ":first-letter": { textTransform: "uppercase" } }}>{error}.</FormHelperText>}
            </FormControl>
        </>
    )
}
