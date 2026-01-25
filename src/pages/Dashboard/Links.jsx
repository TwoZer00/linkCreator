import { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Snackbar, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { deleteUserLink, getUserLinks, setUserLink, updateUserLink, getLinkHealthReports, dismissLinkHealthReports } from '../../firebase/utils'
import { CustomInput } from '../../components/CustomInput'
import { label } from '../../locales/locale'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Close, Delete, Edit, DragIndicator, Analytics, ExpandMore, Warning, NotificationsActive, Clear } from '@mui/icons-material'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}
export default function Links () {
  const [links, setLinks] = useState([])
  const [link, setLink] = useState()
  const [data, setData] = useOutletContext()
  useEffect(() => {
    setLinks(data.userLinks || [])
  }, [data.userLinks])

  const handleClick = ({ id }) => {
    setLink(links.find((link) => link.id === id))
  }
  const handleDelete = async ({ id }) => {
    setData(value => { return { ...value, loading: true } })
    const newLinks = links.filter((link) => link.id !== id)
    const newvisits = data.user.links.visits || { total: 0, byCountry: [], byDevice: [] }
    const linkToDelete = links.find((link) => link.id === id)
    if (linkToDelete?.visits) {
      newvisits.total -= linkToDelete.visits.total || 0
      // Adjust byCountry
      linkToDelete.visits.byCountry?.forEach((countryVisit) => {
        const existingCountry = newvisits.byCountry.find(item => item.country === countryVisit.country)
        if (existingCountry) {
          existingCountry.count -= countryVisit.count
          if (existingCountry.count <= 0) {
            newvisits.byCountry = newvisits.byCountry.filter(item => item.country !== countryVisit.country)
          }
        }
      })
      // Adjust byDevice
      linkToDelete.visits.byDevice?.forEach((deviceVisit) => {
        const existingDevice = newvisits.byDevice.find(item => item.device === deviceVisit.device)
        if (existingDevice) {
          existingDevice.count -= deviceVisit.count
          if (existingDevice.count <= 0) {
            newvisits.byDevice = newvisits.byDevice.filter(item => item.device !== deviceVisit.device)
          }
        }
      })
    }
    setLinks(newLinks)
    await deleteUserLink(id)
    setData(
      (value) => {
        return { ...value, userLinks: newLinks, user: { ...value.user, links: { ...value.user.links, visits: value.user.links.visits, total: (value.user.links.total || 0) - 1 } }, loading: false }
      }
    )
  }
  return (
    <>
      <Stack direction='column' maxHeight='100%' p={1} gap={2}>
        <Typography variant='h1' fontSize={22} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('my-links')}</Typography>
        <Typography variant='h3' fontSize={16} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('my-links-subtitle')}</Typography>
        <InputLink />
        <LinksList onClick={handleClick} deleteAction={handleDelete} />
      </Stack>
    </>
  )
}
const LinksList = ({ ...props }) => {
  const [links, setLinks] = useState([])
  const [linkReports, setLinkReports] = useState({})
  const [data, setData] = useOutletContext()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Separate healthy and broken links
  const healthyLinks = links.filter(link => link.health?.status !== 'broken')
  const brokenLinks = links.filter(link => link.health?.status === 'broken')
  const linksWithReports = links.filter(link => linkReports[link.id]?.length > 0)

  useEffect(() => {
    const fetchLinks = async () => {
      setData((value) => { return { ...value, loading: true } })
      
      // Check if we need to fetch all links or if we already have them
      let tempData
      if (data?.allUserLinks) {
        // Use cached all links if available
        tempData = data.allUserLinks
      } else {
        // Fetch all links and cache them
        tempData = await getUserLinks()
        setData((value) => { return { ...value, allUserLinks: tempData } })
      }
      
      // Sort by order attribute, fallback to creation time
      const sortedLinks = tempData.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        return new Date(a.creationTime) - new Date(b.creationTime)
      })
      setLinks(sortedLinks)
      
      // Fetch health reports for each link
      const reports = {}
      for (const link of sortedLinks) {
        try {
          const linkReports = await getLinkHealthReports(link.id)
          if (linkReports.length > 0) {
            reports[link.id] = linkReports
          }
        } catch (error) {
          console.error('Failed to fetch reports for link:', link.id, error)
        }
      }
      setLinkReports(reports)
      
      setData((value) => { return { ...value, loading: false } })
    }

    fetchLinks()
  }, [])

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over?.id && over) {
      const oldIndex = links.findIndex(item => item.id === active.id)
      const newIndex = links.findIndex(item => item.id === over.id)
      const newOrder = arrayMove(links, oldIndex, newIndex)
      
      // Update order attribute for each link
      const updatedLinks = newOrder.map((link, index) => ({
        ...link,
        order: index
      }))
      
      setLinks(updatedLinks)
      setData((value) => ({ ...value, userLinks: updatedLinks }))
      
      // Save order to database
      updatedLinks.forEach(async (link) => {
        await updateUserLink({ ...link, id: link.id })
      })
    }
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Box flex={1} height='100%' overflow='auto' display='flex' flexDirection='column' gap={2}>
          {/* Links with Reports Section */}
          {linksWithReports.length > 0 && (
            <Accordion sx={{ border: '1px solid orange', mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction='row' alignItems='center' gap={1}>
                  <NotificationsActive color='warning' />
                  <Typography>Link Reports ({linksWithReports.length})</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1}>
                  {linksWithReports.map(link => (
                    <ReportedLinkElement 
                      key={link.id} 
                      link={link} 
                      reports={linkReports[link.id] || []} 
                      onDismiss={async () => {
                        await dismissLinkHealthReports(link.id)
                        setLinkReports(prev => ({ ...prev, [link.id]: [] }))
                      }}
                      {...props} 
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
          
          <SortableContext items={healthyLinks.map(link => link.id)} strategy={verticalListSortingStrategy}>
            {
              healthyLinks?.map((link, index) => {
                return (
                  <SortableLinkElement link={link} key={link.id} {...props} />
                )
              })
            }
          </SortableContext>
          
          {/* Broken Links Section */}
          {brokenLinks.length > 0 && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction='row' alignItems='center' gap={1}>
                  <Warning color='error' />
                  <Typography>{label('hidden-links')} ({brokenLinks.length})</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1}>
                  {brokenLinks.map(link => (
                    <BrokenLinkElement key={link.id} link={link} {...props} />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </DndContext>
    </>
  )
}
const SortableLinkElement = ({ link, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: link.id })

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <LinkElement link={link} dragProps={{ attributes, listeners }} {...props} />
    </div>
  )
}

const ReportedLinkElement = ({ link, reports, onDismiss, ...props }) => {
  const [modal, setModal] = useState({ edit: false, delete: false })
  const brokenReports = reports.filter(r => r.status === 'broken')
  const healthyReports = reports.filter(r => r.status === 'healthy')
  
  return (
    <>
      <Paper variant='outlined' component={Stack} p={2} sx={{ border: '1px solid orange' }}>
        <Stack direction='row' alignItems='center' gap={1} mb={1}>
          <Box flex={1}>
            <Typography variant='h2' fontSize={18}>{link.name}</Typography>
            <Typography variant='h3' fontSize={12} color='text.secondary'>{link.link}</Typography>
          </Box>
          <IconButton onClick={onDismiss} title='Dismiss all reports'>
            <Clear />
          </IconButton>
          <IconButton onClick={() => setModal(value => ({ ...value, edit: true }))}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => setModal(value => ({ ...value, delete: true }))}>
            <Delete />
          </IconButton>
        </Stack>
        
        <Stack gap={1}>
          {brokenReports.length > 0 && (
            <Typography variant='body2' color='error'>
              {brokenReports.length} user(s) reported this link as broken
            </Typography>
          )}
          {healthyReports.length > 0 && (
            <Typography variant='body2' color='success.main'>
              {healthyReports.length} user(s) confirmed this link works
            </Typography>
          )}
        </Stack>
      </Paper>
      <DeleteLink action={props.deleteAction} open={modal.delete} setOpen={setModal} link={link} />
      <EditLink open={modal.edit} setOpen={setModal} link={link} />
    </>
  )
}

const BrokenLinkElement = ({ link, ...props }) => {
  const [modal, setModal] = useState({ edit: false, delete: false })
  const navigate = useNavigate()
  
  return (
    <>
      <Paper variant='outlined' component={Stack} p={1} direction='row' sx={{ opacity: 0.7 }}>
        <Box flex={1}>
          <Typography variant='h2' fontSize={18} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{link.name}</Typography>
          <Typography variant='h3' fontSize={12} color='error'>{link.link}</Typography>
          <Typography variant='caption' color='error'>
            {link.health?.errorMessage || 'Link is broken'}
          </Typography>
        </Box>
        <IconButton onClick={() => { setModal((value) => ({ ...value, edit: true })) }}>
          <Edit />
        </IconButton>
        <IconButton onClick={() => { setModal(value => ({ ...value, delete: true })) }}>
          <Delete />
        </IconButton>
      </Paper>
      <DeleteLink action={props.deleteAction} open={modal.delete} setOpen={setModal} link={link} />
      <EditLink open={modal.edit} setOpen={setModal} link={link} />
    </>
  )
}

const LinkElement = ({ link, dragProps, ...props }) => {
  const [modal, setModal] = useState({ edit: false, delete: false })
  const navigate = useNavigate()
  return (
    <>
      <Paper variant='outlined' component={Stack} p={1} direction='row'>
        <IconButton {...dragProps?.attributes} {...dragProps?.listeners} sx={{ cursor: 'grab' }}>
          <DragIndicator />
        </IconButton>
        <Box flex={1} onClick={() => { props.onClick(link) }}>
          <Typography variant='h2' fontSize={18} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{link.name}</Typography>
          <Typography variant='h3' fontSize={12}>{link.link}</Typography>
        </Box>
        <IconButton onClick={() => navigate(`/dashboard/links/${link.id}/analytics`)}>
          <Analytics />
        </IconButton>
        <IconButton onClick={() => { setModal(value => ({ ...value, delete: true })) }}>
          <Delete />
        </IconButton>
        <IconButton onClick={() => { setModal((value) => ({ ...value, edit: true })) }}>
          <Edit />
        </IconButton>
      </Paper>
      <DeleteLink action={props.deleteAction} open={modal.delete} setOpen={setModal} link={link} />
      <EditLink open={modal.edit} setOpen={setModal} link={link} />
    </>
  )
}
const EditLink = ({ open, setOpen, link }) => {
  return (
    <Dialog open={open} onClose={() => { setOpen(value => ({ ...value, edit: false })) }}>
      <DialogTitle sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('edit-link')}</DialogTitle>
      <DialogContent>
        <Box p={2}>
          <InputLink updatedLink={[link, setOpen]} />
        </Box>
      </DialogContent>
    </Dialog>
  )
}
const DeleteLink = ({ action, open, setOpen, link }) => {
  // console.log(link);

  // const [data,setData] = useOutletContext()

  // const handleDelete = async ({ id }) => {
  //     setData(value => { return { ...value, loading: true } })
  //     const newLinks = links.filter((link) => link.id !== id);
  //     const newvisits = data.user.links.visits || { total: 0, byCountry: [], byDevice: [] };
  //     const linkToDelete = links.find((link) => link.id === id);
  //     if (linkToDelete?.visits) {
  //         newvisits.total -= linkToDelete.visits.total || 0;
  //         // Adjust byCountry
  //         linkToDelete.visits.byCountry?.forEach((countryVisit) => {
  //             const existingCountry = newvisits.byCountry.find(item => item.country === countryVisit.country);
  //             if (existingCountry) {
  //                 existingCountry.count -= countryVisit.count;
  //                 if (existingCountry.count <= 0) {
  //                     newvisits.byCountry = newvisits.byCountry.filter(item => item.country !== countryVisit.country);
  //                 }
  //             }
  //         });
  //         // Adjust byDevice
  //         linkToDelete.visits.byDevice?.forEach((deviceVisit) => {
  //             const existingDevice = newvisits.byDevice.find(item => item.device === deviceVisit.device);
  //             if (existingDevice) {
  //                 existingDevice.count -= deviceVisit.count;
  //                 if (existingDevice.count <= 0) {
  //                     newvisits.byDevice = newvisits.byDevice.filter(item => item.device !== deviceVisit.device);
  //                 }
  //             }
  //         });
  //     }
  //     setLinks(newLinks);
  //     await deleteUserLink(id);
  //     setData(
  //         (value)=>{
  //             return {...value, userLinks: newLinks, user:{...value.user,links:{...value.user.links,visits:value.user.links.visits,total:(value.user.links.total||0)-1}},loading:false}
  //         }
  //     )
  // }
  return (
    <Dialog open={open} onClose={() => { setOpen(value => ({ ...value, delete: false })) }}>
      <DialogTitle sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('delete-link')}</DialogTitle>
      <DialogContent>
        <Box>
          <Typography sx={{ ':first-letter': { textTransform: 'uppercase' } }}>{label('delete-link-message')}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color='error' onClick={() => { setOpen(value => ({ ...value, delete: false })) }}>{label('cancel')}</Button>
        <Button color='error' variant='contained' onClick={() => { action(link); setOpen(value => ({ ...value, delete: false })) }} autoFocus>
          {label('accept')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
// const InputLink = ({ links, setLinks, selectedLink, setSelectedLink }) => {
const InputLink = ({ updatedLink = [] }) => {
  const [errors, setErrors] = useState({})
  const [link, setLink] = useState(updatedLink[0] || { name: '', link: '' })
  const navigate = useNavigate()
  const [data, setData] = useOutletContext()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setData((value) => { return { ...value, loading: true } })
    const form = e.target
    const formData = new FormData(form)
    const tempLink = { ...link }
    if (tempLink.creationTime) {
      tempLink.lastModificationTime = new Date()
    } else {
      tempLink.creationTime = new Date()
    }
    const tempErrors = { ...errors }
    
    // Validate link field
    const linkInput = form.querySelector('#link')
    let normalizedUrl = ''
    if (linkInput) {
      normalizedUrl = linkInput.value.trim()
      
      // Only add https:// if no protocol exists
      if (normalizedUrl && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`
      }
      
      // Validate the URL
      if (!normalizedUrl || !validateURL(normalizedUrl)) {
        tempErrors.link = label('invalid-link-pattern')
      } else {
        // Update the link state with normalized URL
        setLink(prev => ({ ...prev, link: normalizedUrl }))
        tempLink.link = normalizedUrl
        delete tempErrors.link
      }
    }
    
    // Validate other fields
    const nameInput = form.querySelector('#name')
    if (nameInput && !nameInput.value.trim()) {
      // Auto-generate name if empty and URL is valid
      if (!tempErrors.link && normalizedUrl) {
        tempLink.name = getURLSiteName(normalizedUrl)
      } else {
        tempErrors.name = 'Name is required'
      }
    } else if (nameInput) {
      tempLink.name = nameInput.value.trim()
    }
    
    // Validate other required fields
    form.querySelectorAll('input:not(#link):not(#name)').forEach((input) => {
      if (!input.checkValidity()) {
        tempErrors[input.id] = input.validationMessage
      } else {
        delete tempErrors[input.id]
      }
    })
    setErrors(tempErrors)
    if (!Object.keys(tempErrors).length) {
      let resolveLink = {}
      try {
        if (updatedLink[0]) {
          // Reset health status when editing a link
          const linkWithResetHealth = {
            ...tempLink,
            health: {
              status: 'unknown',
              lastChecked: null,
              errorMessage: null
            }
          }
          resolveLink = await updateUserLink({ ...linkWithResetHealth, id: updatedLink[0].id })
          setData((value) => {
            const tempLinks = value.userLinks || []
            return {
              ...value,
              userLinks: tempLinks.map((link) => link.id === resolveLink.id ? resolveLink : link)
            }
          })
          updatedLink[1](value => ({ ...value, edit: false }))
        } else {
          resolveLink = await setUserLink(tempLink)
          setData((value) => {
            const tempLinks = value.userLinks || []
            const links = value.user.links
            return {
              ...value,
              userLinks: [...tempLinks, resolveLink],
              user: {
                ...value.user,
                links: {
                  ...links,
                  total: (links?.total || 0) + 1
                }
              }
            }
          })
        }
        form.reset()
        setLink({ name: '', link: '' })
        setErrors({})
      } catch (error) {
        console.error(error)
        setErrors({ ...errors, global: label(error.code) })
      }
    }
    setData((value) => { return { ...value, loading: false } })
  }

  const validateURL = (url) => {
    if (!url || typeof url !== 'string') return false
    
    // Check for valid URL format
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
    
    if (!urlPattern.test(url)) return false
    
    try {
      const urlObj = new URL(url)
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) return false
      // Must have a valid hostname
      if (!urlObj.hostname || urlObj.hostname.length < 3) return false
      return true
    } catch {
      return false
    }
  }

  const getURLSiteName = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '').split('.')[0]
    } catch {
      return 'Link'
    }
  }
  return (
    <Stack component='form' onSubmit={handleSubmit} noValidate gap={2}>
      <CustomInput id='link' label={label('link')} type='text' placeholder='https://google.com' error={errors?.link} autoComplete='off' required value={link.link} onChange={(e) => { setLink({ ...link, link: e.target.value }) }} />
      <CustomInput id='name' label={label('name')} type='text' error={errors?.name} autoComplete='off' required value={link.name} onChange={(e) => { setLink({ ...link, name: e.target.value }) }} />
      <Button variant='contained' type='submit'>{label('save')}</Button>
      {
            updatedLink[0] && (
              <Button
                variant='outlined' onClick={() => {
                  updatedLink[1](value => ({ ...value, edit: false }))
                }}
              >{label('cancel')}
              </Button>
            )
        }
      <Snackbar
        open={Boolean(errors.global)}
        autoHideDuration={10000}
        onClose={() => {
          setErrors((value) => {
            const temp = { ...value }
            delete temp.global
            return temp
          }
          )
        }}
        message={errors.global || 'error'}
        action={
          <>
            <IconButton
              size='small'
              aria-label='close'
              color='inherit'
              onClick={() => {
                setErrors((value) => {
                  const temp = { ...value }
                  delete temp.global
                  return temp
                }
                )
              }}
            >
              <Close fontSize='small' />
            </IconButton>
          </>
            }
      >
        {/* <Alert
                severity="error"
                onClose={() => {
                    setErrors((value) => {
                        const temp = { ...value }
                        delete temp.global
                        return temp;
                    }
                    )
                }}
            >
                {errors.global || "error"}
            </Alert> */}
      </Snackbar>
    </Stack>
  )
}
