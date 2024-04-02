import { ThemeProvider } from '@emotion/react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, CssBaseline, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, Link, OutlinedInput, Stack, Typography, createTheme } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate, Link as LinkRouterDom } from 'react-router-dom';
import { registerEmailPassword } from '../firebase/utils';
import { CustomInput } from './Login';
import { label, labels } from '../locales/locale'


export default function Register() {
    const theme = createTheme();
    const [error, setError] = useState();
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(event.currentTarget);
        const userRegister = {
            email: data.get('email'),
            username: data.get('username'),
            password: data.get('password'),
        }
        const tempError = {};
        Array.from(form.querySelectorAll('input')).forEach((input) => {
            tempError[input.id] = ""
            if (!input.checkValidity()) {
                tempError[input.id] = input.validationMessage;
            }
            else {
                delete tempError[input.id];
            }
        });
        data.get('password') !== data.get('confirmPassword') && (tempError['confirmPassword'] = "Passwords don't match");
        setError(tempError);
        if (form.checkValidity()) {
            try {
                await registerEmailPassword(userRegister);
                navigate('/dashboard');
            }
            catch (error) {
                // console.log((error.code).replace("/", "-").split("-").includes("password"), error.code, label(error.code));
                if ((error.code).replace("/", "-").split("-").includes("email"))
                    setError({ ...error, email: label(error.code) });
                else if ((error.code).replace("/", "-").split("-").includes("password"))
                    setError({ ...error, password: label(error.code) })
                else if ((error.code).replace("/", "-").split("-").includes("username"))
                    setError({ ...error, username: label(error.code) })
                else
                    setError({ ...error, other: label(error.code) })
            }
        }
    }
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Stack component={"form"} gap={2} onSubmit={handleSubmit} height={"100dvh"} width={"100%"} p={1} justifyContent={"center"} alignItems={"center"} >
                <Box textAlign={"center"}>
                    <Typography variant="h1" fontSize={45}>Register</Typography>
                    <Typography variant="caption">Create your account</Typography>
                </Box>
                <CustomInput id={"email"} label={"Email"} required type={"email"} error={error?.email} />
                <CustomInput id={"username"} label={"Username"} required type={"text"} error={error?.username} />
                <PasswordInput error={{ confirmPassword: error?.confirmPassword, password: error?.password }} />
                <Button variant='contained' type='submit' fullWidth >
                    Register
                </Button>
                <Link component={LinkRouterDom} to={'/login'} variant='body1' textAlign={"center"} >Already register? log in here</Link>
                {Boolean(error?.other) && <FormHelperText error={true} sx={{ ":first-letter": { textTransform: "uppercase" } }}>{error?.other}</FormHelperText>}
            </Stack>
        </ThemeProvider>
    )
}


const PasswordInput = ({ error }) => {
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    return (
        <>
            <FormControl variant="outlined" error={Boolean(error?.password)} fullWidth>
                <InputLabel htmlFor="outlined-adornment-password" error={Boolean(error?.password)}>Password</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    autoComplete='current-password'
                    name='password'
                    label="Password"
                    required
                    error={Boolean(error?.password)}
                />
                {Boolean(error?.password) && <FormHelperText error={Boolean(error?.password)} id="password">{error?.password}</FormHelperText>}
            </FormControl >
            <FormControl variant="outlined" error={Boolean(error?.confirmPassword)} fullWidth>
                <InputLabel error={Boolean(error?.confirmPassword)} htmlFor="confirmPassword">Confirm password</InputLabel>
                <OutlinedInput
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    error={Boolean(error?.confirmPassword)}
                    required
                    name='confirmPassword'
                    autoComplete='confirm-password'
                    label="Confirm password"
                />
                {Boolean(error?.confirmPassword) && <FormHelperText error={Boolean(error?.confirmPassword)} id="confirmPassword">{error?.confirmPassword}</FormHelperText>}
            </FormControl>
        </>
    )
}
