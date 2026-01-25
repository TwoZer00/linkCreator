import { useState, useEffect } from 'react'
import { Alert, Button, Stack, Typography } from '@mui/material'
import { getAuth, sendEmailVerification, signOut, onAuthStateChanged } from 'firebase/auth'
import { label } from '../locales/locale'
import { useNavigate } from 'react-router-dom'

export default function EmailVerification() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        navigate('/dashboard/profile')
      }
    })

    return () => unsubscribe()
  }, [auth, navigate])

  const handleResendEmail = async () => {
    setLoading(true)
    setError('')
    
    try {
      await sendEmailVerification(auth.currentUser)
      setSent(true)
    } catch (error) {
      setError(error.code)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <Stack height='100dvh' justifyContent='center' alignItems='center' p={2}>
      <Stack maxWidth={400} width='100%' gap={2} textAlign='center'>
        <Typography variant='h1' fontSize={32} fontWeight={600}>
          {label('verify-email')}
        </Typography>
        
        <Typography variant='body1' color='text.secondary'>
          {label('verify-email-subtitle')}
        </Typography>

        {sent && (
          <Alert severity='success'>
            {label('verification-email-sent')}
          </Alert>
        )}

        {error && (
          <Alert severity='error'>
            {label(error)}
          </Alert>
        )}

        <Button 
          variant='contained' 
          onClick={handleResendEmail}
          disabled={loading}
          fullWidth
        >
          {loading ? label('sending') : label('resend-verification')}
        </Button>

        <Button 
          variant='outlined' 
          onClick={handleSignOut}
          fullWidth
        >
          {label('sign-out')}
        </Button>
      </Stack>
    </Stack>
  )
}