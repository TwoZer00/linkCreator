import { useState } from 'react'
import { Alert, Button, Stack, Typography } from '@mui/material'
import { CustomInput } from '../components/CustomInput'
import { sendPasswordResetEmail } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import { label } from '../locales/locale'
import { Link, useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await sendPasswordResetEmail(getAuth(), email)
      setSuccess(true)
    } catch (error) {
      setError(error.code)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Stack height='100dvh' justifyContent='center' alignItems='center' p={2}>
        <Stack maxWidth={400} width='100%' gap={2} textAlign='center'>
          <Typography variant='h1' fontSize={32} fontWeight={600}>
            {label('check-email')}
          </Typography>
          <Alert severity='success'>
            {label('reset-email-sent')}
          </Alert>
          <Button variant='outlined' onClick={() => navigate('/login')}>
            {label('back-to-login')}
          </Button>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack height='100dvh' justifyContent='center' alignItems='center' p={2}>
      <Stack maxWidth={400} width='100%' gap={2}>
        <Typography variant='h1' fontSize={32} fontWeight={600} textAlign='center'>
          {label('reset-password')}
        </Typography>
        <Typography variant='body1' color='text.secondary' textAlign='center'>
          {label('reset-password-subtitle')}
        </Typography>
        
        <Stack component='form' onSubmit={handleSubmit} gap={2}>
          <CustomInput
            id='email'
            label={label('email')}
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          {error && (
            <Alert severity='error'>
              {label(error)}
            </Alert>
          )}
          
          <Button 
            type='submit' 
            variant='contained' 
            disabled={loading || !email}
            fullWidth
          >
            {loading ? label('sending') : label('send-reset-email')}
          </Button>
        </Stack>
        
        <Typography variant='body2' textAlign='center'>
          <Link to='/login'>{label('back-to-login')}</Link>
        </Typography>
      </Stack>
    </Stack>
  )
}