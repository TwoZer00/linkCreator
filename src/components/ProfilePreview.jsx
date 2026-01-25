import { Dialog, DialogContent, DialogTitle, IconButton, Box, Stack, Typography, Button } from '@mui/material'
import { Close, Facebook, GitHub, Instagram, LinkedIn, Pinterest, X, YouTube } from '@mui/icons-material'
import CustomAvatar from './CustomAvatar'
import { label } from '../locales/locale'

export default function ProfilePreview({ open, onClose, user, links, customization }) {
  // Function to determine if background is light or dark
  const isLightBackground = (color) => {
    if (!color || color === 'background.default') return true
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128
  }

  const bgColor = customization?.backgroundColor
  const textColor = bgColor && bgColor !== 'background.default' 
    ? (isLightBackground(bgColor) ? '#000000' : '#ffffff')
    : 'text.primary'
  const secondaryTextColor = bgColor && bgColor !== 'background.default'
    ? (isLightBackground(bgColor) ? '#666666' : '#cccccc')
    : 'text.secondary'
  const socialIcons = {
    youtube: <YouTube fontSize='large' />,
    facebook: <Facebook fontSize='large' />,
    x: <X fontSize='large' />,
    linkedin: <LinkedIn fontSize='large' />,
    github: <GitHub fontSize='large' />,
    instagram: <Instagram fontSize='large' />,
    pinterest: <Pinterest fontSize='large' />
  }

  const socialUrls = {
    youtube: 'https://youtube.com/@',
    facebook: 'https://facebook.com/',
    x: 'https://twitter.com/',
    linkedin: 'https://linkedin.com/in/',
    github: 'https://github.com/',
    instagram: 'https://instagram.com/',
    pinterest: 'https://pinterest.com/'
  }

  const getButtonStyle = () => {
    const baseStyle = { fontWeight: 500, fontSize: 18 }
    switch (customization?.buttonStyle) {
      case 'square':
        return { ...baseStyle, borderRadius: 0 }
      case 'pill':
        return { ...baseStyle, borderRadius: 25 }
      default:
        return baseStyle
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Profile Preview
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, height: 500 }}>
        <Box sx={{ 
          backgroundColor: customization?.backgroundColor || 'background.default',
          height: '100%',
          overflow: 'auto'
        }}>
          <Stack direction='column' justifyContent='center' alignItems='center' width='100%' height='100%' gap={1} p={2}>
            <Stack direction='column' justifyContent='center' alignItems='center' width='100%' py={2} gap={1}>
              <CustomAvatar src={user?.avatar} alt={user?.username} sx={{ width: 80, height: 'auto', aspectRatio: 1 }} />
              <Typography variant='h1' fontSize={32} sx={{ 
                fontFamily: customization?.fontFamily,
                color: textColor
              }}>{user?.username || 'Username'}</Typography>
              <Typography variant='body1' fontSize={16} sx={{ 
                fontFamily: customization?.fontFamily,
                color: secondaryTextColor
              }}>{user?.description || 'User description'}</Typography>
              <Stack direction='row' gap={1} alignItems='center'>
                {Object.keys(user?.socialNetwork || {}).map(item => {
                  if (user?.socialNetwork[item]?.length > 0) {
                    return (
                      <Button
                        key={item}
                        variant='text'
                        sx={{ 
                          minWidth: 'auto', 
                          p: 1,
                          color: textColor
                        }}
                      >
                        {socialIcons[item]}
                      </Button>
                    )
                  }
                  return null
                })}
              </Stack>
            </Stack>
            <Stack width='100%' alignItems='center' gap={1} sx={{ flex: 1, overflowY: 'auto' }}>
              {links?.length > 0
                ? links
                    .sort((a, b) => {
                      if (a.order !== undefined && b.order !== undefined) {
                        return a.order - b.order
                      }
                      return new Date(a.creationTime) - new Date(b.creationTime)
                    })
                    .map((link) => (
                      <Button
                        key={link.id}
                        fullWidth
                        variant='outlined'
                        sx={{
                          ...getButtonStyle(),
                          borderColor: customization?.primaryColor || 'primary.main',
                          color: customization?.primaryColor || 'primary.main',
                          fontFamily: customization?.fontFamily
                        }}
                      >
                        {link.name}
                      </Button>
                    ))
                : <Typography variant='h2' fontSize={18} fontStyle='italic' sx={{ 
                    fontFamily: customization?.fontFamily,
                    color: secondaryTextColor
                  }}>
                    {label('no-links')}
                  </Typography>
              }
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  )
}