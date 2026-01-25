import { useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import { Box, Button, Slide, Stack, Toolbar, Typography, useScrollTrigger, Container, Grid, Card, CardContent } from '@mui/material'
import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { Analytics, Palette, DragIndicator, Visibility, Language, Devices } from '@mui/icons-material'
import { label } from '../locales/locale'
import { useTheme } from '@emotion/react'
import ThemeToggle from '../components/ThemeToggle'
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  alignItems: 'flex-start',
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(2),
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    minHeight: 128
  }
}))
const Offset = styled('div')(({ theme }) => theme.mixins.toolbar)
export default function Home () {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)
  const [auth, setAuth] = useState(getAuth())
  const navigate = useNavigate()
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (getAuth().currentUser) {
      setAuth(getAuth())
    }
  }, [getAuth().currentUser])
  return (
    <>
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
        <ThemeToggle />
      </Box>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: 600, mb: 2 }}>
            LinkCreator
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontSize: { xs: 18, md: 24 }, color: 'text.secondary', mb: 4, maxWidth: 600, mx: 'auto' }}>
            {label('hero-subtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" onClick={() => navigate('/register')}>
              {label('get-started-free')}
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
              {label('login')}
            </Button>
          </Stack>
        </Box>

        {/* Features Section */}
        <Box mb={8}>
          <Typography variant="h3" component="h3" textAlign="center" sx={{ fontSize: 32, fontWeight: 600, mb: 6 }}>
            {label('features-title')}
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Analytics sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" component="h4" sx={{ fontSize: 20, fontWeight: 600, mb: 2 }}>
                    {label('realtime-analytics')}
                  </Typography>
                  <Typography color="text.secondary">
                    {label('analytics-description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Palette sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" component="h4" sx={{ fontSize: 20, fontWeight: 600, mb: 2 }}>
                    {label('visual-customization')}
                  </Typography>
                  <Typography color="text.secondary">
                    {label('customization-description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <DragIndicator sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" component="h4" sx={{ fontSize: 20, fontWeight: 600, mb: 2 }}>
                    {label('drag-drop')}
                  </Typography>
                  <Typography color="text.secondary">
                    {label('drag-drop-description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" component="h3" sx={{ fontSize: 32, fontWeight: 600, mb: 4 }}>
            {label('why-choose-title')}
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="h4" sx={{ fontSize: 24, fontWeight: 600, color: 'primary.main' }}>{label('free')}</Typography>
                <Typography color="text.secondary">{label('free-description')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="h4" sx={{ fontSize: 24, fontWeight: 600, color: 'primary.main' }}>{label('fast')}</Typography>
                <Typography color="text.secondary">{label('fast-description')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="h4" sx={{ fontSize: 24, fontWeight: 600, color: 'primary.main' }}>{label('secure')}</Typography>
                <Typography color="text.secondary">{label('secure-description')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="h4" sx={{ fontSize: 24, fontWeight: 600, color: 'primary.main' }}>{label('mobile')}</Typography>
                <Typography color="text.secondary">{label('mobile-description')}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box textAlign="center" sx={{ py: 6, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
          <Typography variant="h3" component="h3" sx={{ fontSize: 28, fontWeight: 600, mb: 2 }}>
            {label('cta-title')}
          </Typography>
          <Typography sx={{ mb: 3, opacity: 0.9 }}>
            {label('cta-subtitle')}
          </Typography>
          <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }} onClick={() => navigate('/register')}>
            {label('start-building')}
          </Button>
        </Box>
      </Container>
    </>
  )
}

function HideOnScroll (props) {
  const { children, window } = props
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined
  })

  return (
    <Slide appear={false} direction='down' in={!trigger}>
      {children}
    </Slide>
  )
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
  /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
  window: PropTypes.func
}
