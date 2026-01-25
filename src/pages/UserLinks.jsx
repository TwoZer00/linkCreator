import { Alert, AlertTitle, Box, Button, CssBaseline, Link, Paper, Stack, Typography, IconButton, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Facebook, GitHub, Instagram, LinkedIn, Pinterest, X, YouTube, ReportProblem, CheckCircle } from '@mui/icons-material/'
import React, { useRef, useState, useEffect } from 'react'
import { useLoaderData, useParams, Link as RouterLink } from 'react-router-dom'
import { setLinkClickCounter, reportLinkHealth, getLocationFromIp } from '../firebase/utils'
import { label } from '../locales/locale'
import CustomAvatar from '../components/CustomAvatar'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Helmet } from 'react-helmet-async'
import { generateFingerprint } from '../utils/fingerprint'

export default function UserLinks () {
  const [user, setUser] = useState(useLoaderData())
  const [reportSnackbar, setReportSnackbar] = useState(false)
  const [validationDialog, setValidationDialog] = useState({ open: false, linkId: null, linkName: '' })
  const [confirmDialog, setConfirmDialog] = useState({ open: false, linkId: null, linkName: '' })
  const [successSnackbar, setSuccessSnackbar] = useState(false)
  const params = useParams()
  const ref = useRef({ youtube: ['https://youtube.com/@', <YouTube fontSize='large' />], facebook: ['https://facebook.com/', <Facebook fontSize='large' />], x: ['https://twitter.com/', <X fontSize='large' />], linkedin: ['https://linkedin/', <LinkedIn fontSize='large' />], github: ['https://github.com/', <GitHub fontSize='large' />], instagram: ['https://instagram.com/', <Instagram fontSize='large' />], pinterest: ['https://pinterest.com/', <Pinterest fontSize='large' />] })
  
  // SEO data
  const pageTitle = `${user?.username || 'User'} - LinkCreator Profile`
  const pageDescription = user?.description 
    ? `${user.description} - Check out ${user.username}'s links and social media profiles.`
    : `Visit ${user?.username || 'this user'}'s LinkCreator profile to access all their important links in one place.`
  const pageUrl = `${window.location.origin}/${user?.username || params.user}`
  const linksList = user?.links?.map(link => link.name).join(', ') || ''
  const socialNetworks = Object.keys(user?.socialNetwork || {}).filter(key => user?.socialNetwork[key]).join(', ')
  
  const customization = user?.customization || {
    primaryColor: '#1976d2',
    backgroundColor: '#ffffff',
    buttonStyle: 'rounded',
    fontFamily: 'Roboto',
    layout: 'centered'
  }
  
  const customTheme = createTheme({
    palette: {
      primary: {
        main: customization.primaryColor,
      },
      background: {
        default: customization.backgroundColor,
      },
    },
    typography: {
      fontFamily: customization.fontFamily,
    },
  })
  
  const getButtonStyle = () => {
    const baseStyle = { fontWeight: 500, fontSize: 18 }
    switch (customization.buttonStyle) {
      case 'square':
        return { ...baseStyle, borderRadius: 0 }
      case 'pill':
        return { ...baseStyle, borderRadius: 25 }
      default:
        return baseStyle
    }
  }
  const handleClick = async ({ link, id, name }) => {
    try {
      await setLinkClickCounter(id, user.id)
      window.open(link, '_blank')
      
      // Show validation dialog after a delay (when user might return)
      setTimeout(() => {
        setValidationDialog({ open: true, linkId: id, linkName: name })
      }, 3000) // 3 seconds delay
    } catch (error) {
      console.error(error)
    }
  }
  
  const reportBrokenLink = async (linkId) => {
    try {
      const fingerprint = generateFingerprint()
      await reportLinkHealth(linkId, user.id, {
        status: 'broken',
        reportedBy: 'visitor',
        userAgent: navigator.userAgent,
        fingerprint
      })
      return true
    } catch (error) {
      console.error('Failed to report broken link:', error)
      return false
    }
  }
  
  const confirmLinkWorked = async (linkId) => {
    try {
      const fingerprint = generateFingerprint()
      await reportLinkHealth(linkId, user.id, {
        status: 'healthy',
        reportedBy: 'visitor',
        userAgent: navigator.userAgent,
        fingerprint
      })
      setValidationDialog({ open: false, linkId: null, linkName: '' })
      setSuccessSnackbar(true)
    } catch (error) {
      console.error('Failed to confirm link health:', error)
    }
  }
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${user?.username}, links, social media, profile, ${linksList}, ${socialNetworks}`} />
        <meta name="author" content={user?.username} />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={user?.avatar ? `${window.location.origin}/api/avatar/${user.avatar}` : `${window.location.origin}/default-avatar.png`} />
        <meta property="profile:username" content={user?.username} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={user?.avatar ? `${window.location.origin}/api/avatar/${user.avatar}` : `${window.location.origin}/default-avatar.png`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": user?.username,
            "description": user?.description,
            "url": pageUrl,
            "image": user?.avatar ? `${window.location.origin}/api/avatar/${user.avatar}` : undefined,
            "sameAs": Object.keys(user?.socialNetwork || {}).filter(key => user?.socialNetwork[key]).map(key => {
              const baseUrls = {
                youtube: 'https://youtube.com/@',
                facebook: 'https://facebook.com/',
                x: 'https://twitter.com/',
                linkedin: 'https://linkedin.com/in/',
                github: 'https://github.com/',
                instagram: 'https://instagram.com/',
                pinterest: 'https://pinterest.com/'
              }
              return baseUrls[key] + user.socialNetwork[key]
            })
          })}
        </script>
      </Helmet>
      
      <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box width='100dvw' height='100dvh' sx={{ backgroundColor: customization.backgroundColor }}>
        <Stack direction='column' justifyContent='center' alignItems='center' width='100%' height='100%' gap={1} p={1}>
          <Stack direction='column' justifyContent='center' alignItems='center' width='100%' py={2} gap={1} flex={0}>
            <CustomAvatar src={user?.avatar} alt={user?.username} sx={{ width: 80, height: 'auto', aspectRatio: 1 }} />
            <Typography variant='h1' fontSize={45}>{user?.username}</Typography>
            <Typography variant='body1' fontSize={16}>{user?.description}</Typography>
            <Stack direction='row' gap={1} alignItems='center'>
              {Object.keys(user?.socialNetwork || [])?.map(item => {
                if (user?.socialNetwork[item]?.length > 0) {
                  return <Link component={Button} variant='inherit' color='rgb(0,0,0)' key={item} href={ref.current[item][0] + user?.socialNetwork[item]} target='_blank' rel='noreferrer'>{ref.current[item][1]}</Link>
                }
              })}
            </Stack>
          </Stack>
          <Stack height='100%' maxWidth='md' width='100%' sx={{ overflowY: 'auto' }} alignItems='center' gap={1} p={1}>
            {user.links?.length > 0
              ? user.links
                  ?.sort((a, b) => {
                    if (a.order !== undefined && b.order !== undefined) {
                      return a.order - b.order
                    }
                    return new Date(a.creationTime) - new Date(b.creationTime)
                  })
                  ?.map((link) => {
                    return (
                      <Stack key={link.id} direction='row' alignItems='center' width='100%' gap={1}>
                        <Button 
                          color='primary' 
                          fullWidth 
                          variant='outlined' 
                          sx={getButtonStyle()} 
                          onClick={() => { handleClick({ ...link, name: link.name }) }}
                        >
                          {link.name}
                        </Button>
                      </Stack>
                    )
              })
              : <Typography variant='h2' fontSize={18} fontStyle='italic' color='GrayText' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('no-links')}</Typography>}
          </Stack>
          <Typography variant='h2' fontSize={12} fontStyle='italic' color='GrayText' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('footer-userlinks-message')} <Link component={RouterLink} to='/'>{label('here')}</Link> </Typography>
        </Stack>
        <Warning />
        
        <Snackbar
          open={reportSnackbar}
          autoHideDuration={3000}
          onClose={() => setReportSnackbar(false)}
          message={label('link-reported')}
        />
        
        <Snackbar
          open={successSnackbar}
          autoHideDuration={3000}
          onClose={() => setSuccessSnackbar(false)}
          message={label('link-confirmed')}
        />
        
        <Dialog 
          open={validationDialog.open} 
          onClose={() => {}}
          disableEscapeKeyDown
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color='primary' />
            {label('did-link-work')}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {label('link-validation-message').replace('{linkName}', validationDialog.linkName)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                reportBrokenLink(validationDialog.linkId)
                setValidationDialog({ open: false, linkId: null, linkName: '' })
              }}
              color='error'
            >
              {label('no-issues')}
            </Button>
            <Button 
              variant='contained' 
              onClick={() => confirmLinkWorked(validationDialog.linkId)}
              startIcon={<CheckCircle />}
            >
              {label('worked-perfectly')}
            </Button>
          </DialogActions>
        </Dialog>
        
        <Dialog 
          open={confirmDialog.open} 
          onClose={() => setConfirmDialog({ open: false, linkId: null, linkName: '' })}
        >
          <DialogTitle>{label('report-broken')}</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to report "{confirmDialog.linkName}" as broken?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, linkId: null, linkName: '' })}>
              {label('cancel')}
            </Button>
            <Button 
              variant='contained' 
              color='error'
              onClick={async () => {
                const success = await reportBrokenLink(confirmDialog.linkId)
                setConfirmDialog({ open: false, linkId: null, linkName: '' })
                if (success) setReportSnackbar(true)
              }}
            >
              {label('report-broken')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
    </>
  )
}
const Warning = () => {
  const [check, setCheck] = useState(true)
  return (
    <>
      {check &&
        <Box
          component={Alert} severity='warning' variant='standard' width='100%' position='fixed' bottom={0} left={0} height='auto' fontSize={12} action={
            <Button color='inherit' size='small' sx={{ my: 'auto' }} onClick={() => { setCheck(false) }}>
              understood
            </Button>
                }
        >
          <AlertTitle>
            Accept user aggrement
          </AlertTitle>
          By clicking on any link from here you are allowing the collection of information from your device (IP address, browser and any other necessary for analytics purposes).
        </Box>}

    </>
  )
}

const LinkA = React.forwardRef((props, ref) => <Paper {...props} ref={ref} />)
