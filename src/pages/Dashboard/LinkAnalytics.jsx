import { useEffect, useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { Typography, Box, Paper, Stack, Button, Grid, Card, CardContent } from '@mui/material'
import { ArrowBack, Visibility, Language, Devices } from '@mui/icons-material'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { onSnapshot, doc, getFirestore, collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { app } from '../../firebase/init'
import { getCountryName } from '../../utils/countries'
import { label } from '../../locales/locale'

export default function LinkAnalytics() {
  const { linkId } = useParams()
  const navigate = useNavigate()
  const [data] = useOutletContext()
  const [link, setLink] = useState(null)
  const [monthlyChange, setMonthlyChange] = useState({ percentage: 0, thisMonth: 0, lastMonth: 0 })

  useEffect(() => {
    const fetchAndSetupLink = async () => {
      const db = getFirestore(app)
      let foundLink = data?.userLinks?.find(l => l.id === linkId)
      
      // If link not found in context (e.g., after refresh), fetch directly from Firebase
      if (!foundLink) {
        try {
          const linkRef = doc(db, 'user', getAuth().currentUser.uid, 'link', linkId)
          const linkDoc = await getDocs(collection(db, `user/${getAuth().currentUser.uid}/link`))
          foundLink = linkDoc.docs.find(doc => doc.id === linkId)?.data()
          if (foundLink) {
            foundLink.id = linkId
          }
        } catch (error) {
          console.error('Error fetching link:', error)
          return
        }
      }
      
      if (foundLink) {
        setLink(foundLink)
        
        // Set up real-time listener for this specific link
        const linkRef = doc(db, 'user', getAuth().currentUser.uid, 'link', linkId)
        const unsubscribe = onSnapshot(linkRef, async (doc) => {
          if (doc.exists()) {
            setLink({ ...doc.data(), id: doc.id })
            
            // Recalculate monthly change when link data updates
            const visitCollection = collection(db, `user/${getAuth().currentUser.uid}/link/${linkId}/visit`)
            const visitSnapshot = await getDocs(visitCollection)
            const visits = visitSnapshot.docs.map(doc => doc.data())
            
            const now = new Date()
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            
            const thisMonthVisits = visits.filter(visit => {
              const visitDate = visit.creationTime.toDate()
              return visitDate >= thisMonthStart
            }).length
            
            const lastMonthVisits = visits.filter(visit => {
              const visitDate = visit.creationTime.toDate()
              return visitDate >= lastMonthStart && visitDate < thisMonthStart
            }).length
            
            if (lastMonthVisits === 0) {
              setMonthlyChange({
                percentage: thisMonthVisits > 0 ? (thisMonthVisits > 10 ? '∞' : thisMonthVisits * 100) : 0,
                thisMonth: thisMonthVisits,
                lastMonth: lastMonthVisits
              })
            } else {
              const change = ((thisMonthVisits - lastMonthVisits) / lastMonthVisits) * 100
              setMonthlyChange({
                percentage: Math.round(change * 10) / 10,
                thisMonth: thisMonthVisits,
                lastMonth: lastMonthVisits
              })
            }
          }
        })
        
        return () => unsubscribe()
      }
    }
    
    if (getAuth().currentUser) {
      fetchAndSetupLink()
    }
  }, [linkId, data?.userLinks])

  if (!link) {
    return (
      <Stack gap={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/links')}>
          {label('back')}
        </Button>
        <Typography>Link not found</Typography>
      </Stack>
    )
  }

  const visits = link.visits || { total: 0, byCountry: [], byDevice: [] }
  const countriesWithNames = visits.byCountry?.map(item => ({
    ...item,
    countryName: getCountryName(item.country)
  })) || []
  const topCountry = countriesWithNames.sort((a, b) => b.count - a.count)[0]
  const topDevice = visits.byDevice?.sort((a, b) => b.count - a.count)[0]

  return (
    <Stack gap={3}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/links')}>
          {label('back')}
        </Button>
        <Typography variant="h1" fontSize={22} sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
          {label('link-analytics')}
        </Typography>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h2" fontSize={18} gutterBottom sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
          {link.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
          {link.link}
        </Typography>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="flex-start" gap={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Visibility color="primary" />
                </Stack>
                <Typography variant="h6" fontSize={14}>{label('total-visits')}</Typography>
              </Stack>
              <Typography variant="h3" fontSize={32} fontWeight="bold">
                {visits.total}
              </Typography>
              <Typography variant="body2" color={monthlyChange.percentage >= 0 ? 'success.main' : 'error.main'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {monthlyChange.percentage >= 0 ? '↗' : '↘'} {monthlyChange.percentage}% {label('this-month')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="flex-start" gap={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Language color="primary" />
                </Stack>
                <Typography variant="h6" fontSize={14}>{label('top-country')}</Typography>
              </Stack>
              <Typography variant="h4" fontSize={24} fontWeight="bold">
                {topCountry?.countryName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topCountry?.count || 0} visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="flex-start" gap={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Devices color="primary" />
                </Stack>
                <Typography variant="h6" fontSize={14}>{label('top-device')}</Typography>
              </Stack>
              <Typography variant="h4" fontSize={24} fontWeight="bold">
                {topDevice?.device || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topDevice?.count || 0} visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">{label('created')}</Typography>
              <Typography variant="body1">
                {link.creationTime ? new Date(link.creationTime.seconds * 1000).toLocaleDateString() : 'N/A'}
              </Typography>
              {link.lastModificationTime && (
                <>
                  <Typography variant="h6" sx={{ mt: 1 }}>{label('modified')}</Typography>
                  <Typography variant="body1">
                    {new Date(link.lastModificationTime.seconds * 1000).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontSize={14}>{label('this-month')}</Typography>
              <Typography variant="h3" fontSize={24} fontWeight="bold">
                {monthlyChange.thisMonth}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontSize={14}>{label('last-month')}</Typography>
              <Typography variant="h3" fontSize={24} fontWeight="bold">
                {monthlyChange.lastMonth}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontSize={14}>{label('difference')}</Typography>
              <Typography variant="h3" fontSize={24} fontWeight="bold" color={monthlyChange.thisMonth - monthlyChange.lastMonth >= 0 ? 'success.main' : 'error.main'}>
                {monthlyChange.thisMonth - monthlyChange.lastMonth >= 0 ? '+' : ''}{monthlyChange.thisMonth - monthlyChange.lastMonth}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontSize={14}>{label('growth-rate')}</Typography>
              <Typography variant="h3" fontSize={24} fontWeight="bold" color={monthlyChange.percentage >= 0 ? 'success.main' : 'error.main'}>
                {monthlyChange.percentage >= 0 ? '+' : ''}{monthlyChange.percentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {visits.byCountry?.length > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h2" fontSize={18} gutterBottom sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                {label('visits-by-country')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countriesWithNames.map(item => ({ name: item.countryName, value: item.count }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {countriesWithNames.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h2" fontSize={18} gutterBottom sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                {label('visits-by-device')}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visits.byDevice?.map(item => ({ name: item.device, visits: item.count })) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {visits.byCountry?.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h2" fontSize={18} gutterBottom sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
            {label('detailed-breakdown')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontSize={16} gutterBottom sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                {label('visits-by-country')}
              </Typography>
              <Stack gap={1}>
                {countriesWithNames.sort((a, b) => b.count - a.count).map((country, index) => (
                  <Box key={country.country} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent', borderRadius: 1 }}>
                    <Typography>{country.countryName}</Typography>
                    <Typography fontWeight="bold">{country.count}</Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            
            {visits.byDevice?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h3" fontSize={16} gutterBottom sx={{ ':first-letter': { textTransform: 'uppercase' } }}>
                  {label('visits-by-device')}
                </Typography>
                <Stack gap={1}>
                  {visits.byDevice.sort((a, b) => b.count - a.count).map((device, index) => (
                    <Box key={device.device} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent', borderRadius: 1 }}>
                      <Typography>{device.device}</Typography>
                      <Typography fontWeight="bold">{device.count}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Stack>
  )
}