import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, Button, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, Link, OutlinedInput, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate, Link as LinkRouterDom } from 'react-router-dom'
import { registerEmailPassword } from '../firebase/utils'
import { BackButton, CustomInput } from './Login'
import { label } from '../locales/locale'

export default function Register () {
  const [error, setError] = useState()
  const navigate = useNavigate()
  // const [data, setData] = useOutletContext();
  const handleSubmit = async (event) => {
    event.preventDefault()
    // setData((value) => { return { ...value, loading: true } })
    const form = event.currentTarget
    const data = new FormData(event.currentTarget)
    const userRegister = {
      email: data.get('email'),
      username: data.get('username'),
      password: data.get('password')
    }
    const tempError = {}
    Array.from(form.querySelectorAll('input')).forEach((input) => {
      tempError[input.id] = ''
      if (!input.checkValidity()) {
        tempError[input.id] = input.validationMessage
      } else {
        delete tempError[input.id]
      }
    })
    data.get('password') !== data.get('confirmPassword') && (tempError.confirmPassword = "Passwords don't match")
    setError(tempError)
    if (form.checkValidity()) {
      try {
        await registerEmailPassword(userRegister)
        navigate('/verify-email')
      } catch (error) {
        if ((error.code).replace('/', '-').split('-').includes('email')) { setError({ ...error, email: label(error.code) }) } else if ((error.code).replace('/', '-').split('-').includes('password')) { setError({ ...error, password: label(error.code) }) } else if ((error.code).replace('/', '-').split('-').includes('username')) { setError({ ...error, username: label(error.code) }) } else { setError({ ...error, other: label(error.code) }) }
      } finally {
        // setData((value) => { return { ...value, loading: false } })
      }
    } else {
      // setData((value) => { return { ...value, loading: false } })
    }
  }
  return (
    <>
      <Box>
        <BackButton />
      </Box>
      <Stack maxWidth='sm' mx='auto' component='form' gap={2} onSubmit={handleSubmit} height='100%' width='100%' p={1} justifyContent='center' alignItems='center'>
        <Box textAlign='center'>
          <Typography variant='h1' fontSize={45} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('register')}</Typography>
          <Typography variant='subtitle1' fontSize={14} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('register-subtitle')}</Typography>
        </Box>
        <CustomInput id='email' label={label('email')} required type='email' error={error?.email} autoComplete='email' name='email' autoFocus />
        <CustomInput id='username' label={label('username')} required type='text' error={error?.username} autoComplete='username' name='username' />
        <PasswordInput error={{ confirmPassword: error?.confirmPassword, password: error?.password }} />
        <Button variant='contained' type='submit' fullWidth>
          {label('register')}
        </Button>
        <Link component={LinkRouterDom} to='/login' replace variant='body1' textAlign='center' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('login-here')}</Link>
        {Boolean(error?.other) && <FormHelperText error sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{error?.other}</FormHelperText>}
      </Stack>
    </>
  )
}

const PasswordInput = ({ error }) => {
  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const handleMouseDownPassword = (event) => {
    event.preventDefault()
  }
  return (
    <>
      <FormControl variant='outlined' error={Boolean(error?.password)} fullWidth>
        <InputLabel htmlFor='outlined-adornment-password' error={Boolean(error?.password)} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('password')}</InputLabel>
        <OutlinedInput
          id='outlined-adornment-password'
          type={showPassword ? 'text' : 'password'}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                aria-label='toggle password visibility'
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge='end'
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
                    }
          autoComplete='current-password'
          name='password'
          label={label('password')}
          required
          error={Boolean(error?.password)}
        />
        {Boolean(error?.password) && <FormHelperText error={Boolean(error?.password)} id='password'>{error?.password}</FormHelperText>}
      </FormControl>
      <FormControl variant='outlined' error={Boolean(error?.confirmPassword)} fullWidth>
        <InputLabel error={Boolean(error?.confirmPassword)} htmlFor='confirmPassword' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('confirm-password')}</InputLabel>
        <OutlinedInput
          id='confirmPassword'
          type={showPassword ? 'text' : 'password'}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                aria-label='toggle password visibility'
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge='end'
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
                    }
          error={Boolean(error?.confirmPassword)}
          required
          name='confirmPassword'
          autoComplete='confirm-password'
          label={label('confirm-password')}
        />
        {Boolean(error?.confirmPassword) && <FormHelperText error={Boolean(error?.confirmPassword)} id='confirmPassword'>{error?.confirmPassword}</FormHelperText>}
      </FormControl>
    </>
  )
}
