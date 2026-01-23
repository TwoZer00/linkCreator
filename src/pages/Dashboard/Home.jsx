import { Box, Button, DialogContent, DialogTitle, Link, List, ListItem, ListItemText, ListSubheader, Paper, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { getUserLinks, getUserLinksOfLastMonth } from '../../firebase/utils'
import { useOutletContext } from 'react-router-dom'
import { label } from '../../locales/locale'
import { isoAlphaCode2ToCountries } from '../../utils/const'
import ModalComponent from '../../components/ModalComponent'
import { OpenInNew } from '@mui/icons-material'

export function Home () {
  const [links, setLinks] = useState([])
  const [modal, setModal] = useState(false)
  const modalContent = useRef('')
  const [data, setData] = useOutletContext()
  useEffect(() => {
    const fetchLinksData = async () => {
      setData((value) => { return { ...value, loading: true } })
      const userLinks = data?.userLinks || await getUserLinksOfLastMonth()
      setLinks(userLinks)
      setData((value) => { return { ...value, loading: false, userLinks } })
    }
    if (links.length === 0 && data?.loading != true) {
      fetchLinksData()
    }
  }, [])
  const handleModal = (target) => {
    setModal(true)
    modalContent.current = target
  }
  return (
    <>
      <Stack width='100%' height='100%' gap={2}>
        {/* HEADER */}
        <Stack component={Paper} variant='outlined' p={1} justifyContent='space-evenly' direction='row'>
          <Box textAlign='center'>
            <Typography variant='h2' fontSize={22} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('links')}</Typography>
            <Typography variant='body1' fontSize={16}>{data.user?.links?.total || 0}</Typography>
          </Box>
          <Box textAlign='center'>
            <Typography variant='h2' fontSize={22} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('visits')}</Typography>
            <Typography variant='body1' fontSize={16}>{data.user?.links?.visits?.total || 0}</Typography>
          </Box>
        </Stack>
        {/* last links */}
        <Stack component={Paper} variant='outlined' height='fit-content'>
          <List
            subheader={
              <ListSubheader component='div' id='nested-list-subheader' sx={{ display: 'flex', justifyContent: 'space-between', ':first-letter': { textTransform: 'uppercase' } }}><Typography variant='inherit' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('latest-links')}</Typography><Typography variant='inherit' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('visits')}</Typography></ListSubheader>
                        }
          >
            {links?.length > 0
              ? (links.sort((a, b) => b.creationTime.seconds - a.creationTime.seconds).slice(0, 4)?.map((link) => {
                  return (
                    <ListItem key={link.id}>
                      <ListItemText primary={link.name} secondary={<Button target='_blank' rel='noopener noreferrer' href={link.link} endIcon={<OpenInNew />} variant='text' color='info' sx={{ textTransform: 'lowercase' }} component={Link}><Typography title={link.link} variant='inherit' color='inherit' sx={{ maxWidth: '15ch', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.link}</Typography></Button>} sx={{ ':first-letter': { textTransform: 'uppercase' }, flexGrow: 2 }} primaryTypographyProps={{ maxWidth: '12ch', noWrap: true }} secondaryTypographyProps={{ noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} />
                      <ListItemText primary={link.visits?.total || 0} sx={{ flexGrow: 0 }} primaryTypographyProps={{ width: 'fit-content' }} />
                    </ListItem>
                  )
                }))
              : <Typography color='GrayText' textAlign='center' p={2} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                {label('no-links')}
                </Typography>}
          </List>
          {
                        links?.length > 4 && (
                          <Button variant='text' color='info' size='small' onClick={() => handleModal('links')}>
                            {label('load-more')}
                          </Button>
                        )
                    }

        </Stack>
        {/* Top countries */}
        <Stack component={Paper} variant='outlined' height='fit-content'>
          <List
            subheader={
              <ListSubheader component='div' id='nested-list-subheader' sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant='inherit' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('top-countries')}</Typography><Typography variant='inherit' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('visits')}</Typography></ListSubheader>
                        }
          >
            {data.user?.links?.visits?.byCountry?.filter(item => item.count > 0).length > 0
              ? data.user?.links?.visits?.byCountry?.slice(0, 5).map((country) => {
                return (
                  <ListItem key={country.country}>
                    <ListItemText primary={isoAlphaCode2ToCountries[country.country]} sx={{ ':first-letter': { textTransform: 'uppercase' }, flexGrow: 2 }} primaryTypographyProps={{ maxWidth: '12ch', noWrap: true }} secondaryTypographyProps={{ maxWidth: '22ch', noWrap: true }} />
                    <ListItemText primary={country.count || 0} sx={{ flexGrow: 0 }} primaryTypographyProps={{ width: 'fit-content' }} />
                  </ListItem>
                )
              })

              : <Typography color='GrayText' textAlign='center' p={2} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                {
                                    label('not-enough-data')
                                }
                </Typography>}
          </List>
          {
                        data.user?.links?.visits?.byCountry?.filter(item => item.count > 0).length > 5 && (
                          <Button variant='text' color='info' size='small' onClick={() => handleModal('countries')}>
                            {label('load-more')}
                          </Button>
                        )
                    }
        </Stack>
        {/* Top devices */}
        <Stack component={Paper} variant='outlined'>
          <List
            subheader={
              <ListSubheader component='div' id='nested-list-subheader' sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant='inherit' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('top-devices')}</Typography><Typography variant='inherit' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('devices')}</Typography></ListSubheader>
                        }
          >
            {data.user?.links?.visits?.byDevice?.filter(item => item.count > 0).length > 0
              ? data.user?.links?.visits?.byDevice?.slice(0, 5).map((item) => {
                return (
                  <ListItem key={item.device}>
                    <ListItemText primary={item.device} sx={{ ':first-letter': { textTransform: 'uppercase' }, flexGrow: 2 }} primaryTypographyProps={{ maxWidth: '12ch', noWrap: true }} secondaryTypographyProps={{ maxWidth: '22ch', noWrap: true }} />
                    <ListItemText primary={item.count || 0} sx={{ flexGrow: 0 }} primaryTypographyProps={{ width: 'fit-content' }} />
                  </ListItem>
                )
              })
              : <Typography color='GrayText' textAlign='center' p={2} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                {
                                    label('not-enough-data')
                                }
                </Typography>}
          </List>
          {
                        data.user?.links?.visits?.byCountry?.filter(item => item.count > 0).length > 5 && (
                          <Button variant='text' color='info' size='small' onClick={() => handleModal('devices')}>
                            {label('load-more')}
                          </Button>
                        )
                    }
        </Stack>
      </Stack>
      <ModalComponent open={modal} setOpen={setModal} children={<DetailView dataRef={modalContent.current} />} />
    </>
  )
}
const dataR = {
  countries: 'countries',
  links: 'links',
  devices: 'devices'
}
const DetailView = ({ dataRef }) => {
  const [data, setData] = useOutletContext()
  const [content, setContent] = useState([])
  const [titles, setTitles] = useState([])
  useEffect(
    () => {
      if (dataRef === dataR.countries) {
        const countries = data.user?.links?.visits?.byCountry
        setData(
          prev => ({
            ...prev,
            user: {
              ...prev.user,
              links: {
                ...prev.user.links,
                visits: {
                  ...prev.user.links.visits,
                  byCountry: countries
                }
              }
            }
          })
        )
      } else if (dataRef === dataR.links) {
        const links = getUserLinks()
        links.then(res => setData(prev => ({ ...prev, userLinks: res })))
      } else if (dataRef === dataR.devices) {
        const devices = data.user?.links?.visits?.byDevice
        setData(
          prev => ({
            ...prev,
            user: {
              ...prev.user,
              links: {
                ...prev.user.links,
                visits: {
                  ...prev.user.links.visits,
                  byDevice: devices
                }
              }

            }
          })
        )
      }
    }
    , [])

  useEffect(
    () => {
      setContent(
        data && dataRef === 'countries'
          ? data.user?.links?.visits?.byCountry?.map((item) => {
            return {
              item: isoAlphaCode2ToCountries[item.country],
              count: item.count
            }
          })
          : dataRef === 'links'
            ? data.userLinks?.map((item) => {
              return {
                item: item.name,
                count: item.visits?.total || 0
              }
            })
            : data && dataRef === 'devices'
              ? data.user?.links?.visits?.byDevice?.map((item) => {
                return {
                  item: item.device,
                  count: item.count
                }
              })
              : []
      )
      setTitles(data && dataRef === 'countries'
        ? ['top-countries', 'country', 'visits']
        : dataRef === 'links'
          ? ['my-links', 'link', 'visits']
          : data && dataRef === 'devices' ? ['top-devices', 'device', 'visits'] : []
      )
    }
    , [data])
  return (
    <>
      <DialogTitle>
        {label(titles[0])}
      </DialogTitle>
      <DialogContent>
        <List
          sx={{ maxHeight: 300 }}
          subheader={
            <ListSubheader component='div' id='nested-list-subheader' sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='inherit' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                {label(titles[1])}
              </Typography>
              <Typography variant='inherit' sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                {label(titles[2])}
              </Typography>
            </ListSubheader>
                    }
        >

          {content?.map((item, index) => {
            return (
              <ListItem key={item.item + index}>
                <ListItemText primary={item.item} />
                <ListItemText primary={item.count} sx={{ textAlign: 'right' }} />
              </ListItem>
            )
          })}
        </List>
      </DialogContent>
    </>
  )
}
