import { Alert, Button, Stack, Typography, Box, TextField, MenuItem } from '@mui/material'
import { useEffect, useState } from 'react'
import { CustomInput } from '../../components/CustomInput'
import { checkUsernameAvailability, createUser, getUser, updateAvatarImage, updateUser } from '../../firebase/utils'
import { getAuth, signOut } from 'firebase/auth'
import { label } from '../../locales/locale'
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom'
import CustomAvatar from '../../components/CustomAvatar'
import { useTheme } from '@emotion/react'

export default function Profile () {
  const theme = useTheme()
  const [formData, setFormData] = useState(useLoaderData() || { email: '', username: '', description: '', avatar: '' })
  const [isNewUser, setIsNewUser] = useState()
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const [data, setData] = useOutletContext()
  const [socialNetwork, setSocialNetwork] = useState({ youtube: '', facebook: '', x: '', linkedin: '', github: '', instagram: '', pinterest: '' })
  const [customization, setCustomization] = useState({
    primaryColor: '#1976d2',
    backgroundColor: '#ffffff',
    buttonStyle: 'rounded',
    fontFamily: 'Roboto'
  })
  useEffect(() => {
    const fetchUserData = async () => {
      setData(value => { return { ...value, loading: true } })
      try {
        const tempData = data?.user || await getUser()
        setFormData({ ...tempData, avatar: undefined })
        setSocialNetwork(tempData.socialNetwork || { youtube: '', facebook: '', x: '', linkedin: '', github: '', instagram: '', pinterest: '' })
        setCustomization(tempData.customization || {
          primaryColor: '#1976d2',
          backgroundColor: '#ffffff',
          buttonStyle: 'rounded',
          fontFamily: 'Roboto'
        })
        setData(value => { return { ...value, user: tempData } })
      } catch (error) {
        setIsNewUser(true)
      } finally {
        setData(value => { return { ...value, loading: false } })
      }
    }
    if (getAuth().currentUser) {
      fetchUserData()
    }
  }, [getAuth().currentUser])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setData(value => { return { ...value, loading: true } })
    const form = e.target
    const tempErrors = { ...errors }
    form.querySelectorAll('input').forEach(async (input) => {
      switch (input.id) {
        case 'username':
          if (!input.checkValidity()) {
            tempErrors.username = input.validationMessage
          }
          try {
            await checkUsernameAvailability(input.value)
            delete tempErrors.username
          } catch (error) {
            tempErrors.username = error.message
          }
          break
        default:
          if (!input.checkValidity()) {
            tempErrors[input.id] = input.validationMessage
          } else {
            delete tempErrors[input.id]
          }
          break
      }
    })
    setErrors(tempErrors)
    if (Object.keys(tempErrors).length === 0) {
      setErrors({})
      if (isNewUser) {
        console.log('create')
        const tempUser = await createUser({ socialNetwork, customization, username: formData.username })
        setFormData(tempUser)
        setIsNewUser(false)
      } else {
        console.log('update')
        const tempUserData = { ...formData, socialNetwork, customization }
        delete tempUserData.id
        delete tempUserData.email
        try {
          const tempUser = await updateUser(tempUserData)
          console.log(tempUser)
          setFormData({ ...formData, ...tempUser })
          setData(value => { return { ...value, user: { ...value.user, ...tempUser } } })
        } catch (error) {
          console.log(error)
          setErrors({ ...errors, global: error.message })
        }
      }
    }
    setData(value => { return { ...value, loading: false } })
  }
  const handleFile = async (e) => {
    const file = e.target.files[0]
    let error = ''
    if (file.size > 870400) {
      error = 'File size must be less than 850KB'
    }
    if (!file.type.includes('image/')) {
      error = 'File must be a image'
    }
    const tempErrors = { ...errors }
    if (error) {
      tempErrors.avatar = error
    } else {
      delete tempErrors.avatar
    }
    setErrors(tempErrors)
    if (Object.keys(tempErrors).length === 0) {
      await updateAvatarImage(file)
      setFormData(value => { return { ...value, avatar: file } })
      setData(
        value => { return { ...value, user: { ...value.user, avatar: `avatar/${getAuth().currentUser.uid}` } } }
      )
    }
  }

  return (
    <>
      <Typography variant='h1' fontWeight='semibold' fontSize={22} sx={{ ':first-letter': { textTransform: 'uppercase' }, position: 'sticky', top: '0', zIndex: 100, bgcolor: theme.palette.background.default }}>{label('my-profile')}</Typography>
      <Stack rowGap={2} maxHeight='100%' component='form' noValidate onSubmit={handleSubmit}>
        <Stack direction='row' alignItems='center' gap={2}>
          <CustomAvatar profile={[data, setData]} src={formData?.avatar || data?.user?.avatar} alt={formData?.username} sx={{ width: 100, height: 'auto', aspectRatio: 1 }} />
          <CustomInput fullWidth type='file' id='avatar' error={errors?.avatar} name='avatar' accept={'image/*'} onChange={handleFile} />
        </Stack>
        {isNewUser && <Alert severity='warning'>
          {label('warning-message-user')}.
        </Alert>}
        <CustomInput label={label('username')} id='username' name='username' value={formData?.username} error={errors?.username} onChange={(e) => { setFormData({ ...formData, username: e.target.value }) }} required />
        <CustomInput label={label('description')} id='description' multiline rows={3} name='description' value={formData?.description} onChange={(e) => { setFormData({ ...formData, description: e.target.value }) }} />
        <CustomInput label={label('email')} id='email' name='email' value={formData?.email} disabled readOnly />
        <Typography variant='h2' fontSize={18} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('social-networks')}</Typography>
        {Object.keys(socialNetwork).map((key) => {
          return (
            <CustomInput
              key={key}
              label={key}
              placeholder='e.g. twozer00'
              id={key}
              autoComplete={key}
              name={key}
              value={socialNetwork[key]}
              onChange={
                                    (e) => { setSocialNetwork({ ...socialNetwork, [key]: e.target.value }) }
                                }
            />
          )
        })}
        <Typography variant='h2' fontSize={18} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('visual-customization')}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <TextField
            label={label('primary-color')}
            type="color"
            value={customization.primaryColor}
            onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
            size="small"
            InputLabelProps={{ sx: { ':first-letter': { textTransform: 'uppercase' } } }}
          />
          <TextField
            label={label('background-color')}
            type="color"
            value={customization.backgroundColor}
            onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
            size="small"
            InputLabelProps={{ sx: { ':first-letter': { textTransform: 'uppercase' } } }}
          />
          <TextField
            select
            label={label('button-style')}
            value={customization.buttonStyle}
            onChange={(e) => setCustomization({ ...customization, buttonStyle: e.target.value })}
            size="small"
            InputLabelProps={{ sx: { ':first-letter': { textTransform: 'uppercase' } } }}
          >
            <MenuItem value="rounded">{label('rounded')}</MenuItem>
            <MenuItem value="square">{label('square')}</MenuItem>
            <MenuItem value="pill">{label('pill')}</MenuItem>
          </TextField>
          <TextField
            select
            label={label('font-family')}
            value={customization.fontFamily}
            onChange={(e) => setCustomization({ ...customization, fontFamily: e.target.value })}
            size="small"
            InputLabelProps={{ sx: { ':first-letter': { textTransform: 'uppercase' } } }}
          >
            <MenuItem value="Roboto">Roboto</MenuItem>
            <MenuItem value="Inter">Inter</MenuItem>
            <MenuItem value="Poppins">Poppins</MenuItem>
            <MenuItem value="Montserrat">Montserrat</MenuItem>
          </TextField>
        </Box>
        <Stack direction='column' gap={2}>
          <Button variant='contained' type='submit'>{label('save')}</Button>
          <Button type='button' variant='contained' onClick={() => { navigate(`/${formData.username || getAuth().currentUser.uid}`) }}>{label('view-page')}</Button>
          <Button variant='text' color='error' size='small' type='button' onClick={async () => { await signOut(getAuth()); navigate('/') }}>{label('logout')}</Button>
        </Stack>
      </Stack>
    </>

  )
}
