import { Alert, AlertTitle, Avatar, Box, Button, CssBaseline, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import { Facebook, GitHub, Instagram, LinkedIn, Pinterest, X, YouTube } from '@mui/icons-material/';
import React, { useRef } from 'react'
import { useLoaderData, useParams, Link as RouterLink, redirect } from 'react-router-dom'
import { setLinkClickCounter } from '../firebase/utils';
import { label } from '../locales/locale';

export default function UserLinks() {
    const user = useLoaderData();
    const ref = useRef({ youtube: ["https://youtube.com/@", <YouTube fontSize='large' />], facebook: ["https://facebook.com/", <Facebook fontSize='large' />], x: ["https://twitter.com/", <X fontSize='large' />], linkedin: ["https://linkedin/", <LinkedIn fontSize='large' />], github: ["https://github.com/", <GitHub fontSize='large' />], instagram: ["https://instagram.com/", <Instagram fontSize='large' />], pinterest: ["https://pinterest.com/", <Pinterest fontSize='large' />] })
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
        <Box height={"100%"}>
            <CssBaseline />
            <Stack direction="column" justifyContent="center" alignItems="center" width={"100%"} height={"100%"} gap={1} p={1}>
                <Stack direction="column" justifyContent="center" alignItems="center" width={"100%"} py={2} gap={1} flex={0} >
                    <Avatar src={"/img.jpg"} alt={user.username} sx={{ width: 70, height: "auto", aspectRatio: 1 }} />
                    <Typography variant="h1" fontSize={45}>{user.username}</Typography>
                    <Typography variant="body1" fontSize={16}>{user?.description}</Typography>
                    <Stack direction={"row"} gap={1} alignItems={"center"}>
                        {Object.keys(user?.socialNetwork).map(item => {
                            if (user?.socialNetwork[item]) {
                                return <Link component={Button} variant='inherit' color={"rgb(0,0,0)"} key={item} href={ref.current[item][0] + user?.socialNetwork[item]} target="_blank" >{ref.current[item][1]}</Link>
                            }
                        })}
                    </Stack>
                </Stack>
                <Stack height={"100%"} width={"100%"} sx={{ overflowY: "auto" }} alignItems={"center"} gap={1} p={1}>
                    {user.links.length > 0 ? user.links?.map((link) => {
                        return (<Box key={link.id} width={"100%"} p={1} component={Paper} variant='outlined' square onClick={() => { handleClick(link) }}>
                            <Typography variant="h2" fontSize={22} sx={{ ":first-letter": { textTransform: "uppercase" } }} >{link.name}</Typography>
                            <Typography variant="body1" fontSize={10}>{link.link}</Typography>
                        </Box>)
                    })
                        :
                        <Typography variant="h2" fontSize={18} fontStyle={"italic"} color={"GrayText"} sx={{ ":first-letter": { textTransform: 'uppercase' } }}>{label("no-links")}</Typography>
                    }
                </Stack>
                <Typography variant="h2" fontSize={12} fontStyle={"italic"} color={"GrayText"}>{label("footer-userlinks-message")} <Link component={RouterLink} to="/" >{label("here")}</Link> </Typography>
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