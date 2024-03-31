import { Alert, AlertTitle, Avatar, Box, Button, CssBaseline, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import React from 'react'
import { useLoaderData, useParams, Link as RouterLink, redirect } from 'react-router-dom'
import { setLinkClickCounter } from '../firebase/utils';

export default function UserLinks() {
    const user = useLoaderData();
    const handleClick = async ({ link, id }) => {
        try {
            await setLinkClickCounter(id);
        } catch (error) {
            console.error(error);
        }
        finally {
            window.open(link, '_blank');
        }
    }
    return (
        <Box height={"100vh"} width={"100vw"} >
            <CssBaseline />
            <Stack direction="column" justifyContent="center" alignItems="center" width={"100%"} height={"100%"} gap={1} p={1}>
                <Stack direction="column" justifyContent="center" alignItems="center" width={"100%"} py={2} gap={1} flex={0} >
                    <Avatar src={"/img.jpg"} alt={user.username} sx={{ width: 70, height: "auto", aspectRatio: 1 }} />
                    <Typography variant="h1" fontSize={45}>{user.username}</Typography>
                </Stack>
                <Stack height={"100%"} width={"100%"} square sx={{ overflowY: "auto" }} alignItems={"center"} gap={1} p={1}>
                    {user.links.length > 0 ? user.links?.map((link) => {
                        return (<Box key={link.id} width={"100%"} p={1} component={Paper} variant='outlined' square onClick={() => { handleClick(link) }}>
                            <Typography variant="h2" fontSize={22} sx={{ ":first-letter": { textTransform: "uppercase" } }} >{link.name}</Typography>
                            <Typography variant="body1" fontSize={10}>{link.link}</Typography>
                        </Box>)
                    })
                        :
                        <Typography variant="h2" fontSize={18} fontStyle={"italic"} color={"GrayText"}>No links</Typography>
                    }
                </Stack>
                <Typography variant="h2" fontSize={12} fontStyle={"italic"} color={"GrayText"}>Created using linkCreator&copy; , create yours <Link component={RouterLink} to="/" >here</Link> </Typography>
            </Stack>
            {/* <Box component={Alert} icon={false} severity='warning' variant='standard' position={"fixed"} bottom={0} height={"auto"} fontSize={12} dipls action={
                <Button color="inherit" size="small">
                    understood
                </Button>
            }>
                <AlertTitle>
                    Accept user aggrement
                </AlertTitle>
                Clicking any links from here you're accepting user aggrement, more info <Link href='/legacy'>here</Link>
            </Box> */}
        </Box>
    )
}