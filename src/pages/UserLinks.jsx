import { Alert, AlertTitle, Box, Button,Link, Paper, Stack, Typography } from '@mui/material';
import { Facebook, GitHub, Instagram, LinkedIn, Pinterest, X, YouTube } from '@mui/icons-material/';
import React, { useRef, useState } from 'react'
import { useLoaderData, useParams, Link as RouterLink } from 'react-router-dom'
import {  setLinkClickCounter } from '../firebase/utils';
import { label } from '../locales/locale';
import CustomAvatar from '../components/CustomAvatar';

export default function UserLinks() {
    const [user,setUser] = useState(useLoaderData());
    const params = useParams();
    const ref = useRef({ youtube: ["https://youtube.com/@", <YouTube fontSize='large' />], facebook: ["https://facebook.com/", <Facebook fontSize='large' />], x: ["https://twitter.com/", <X fontSize='large' />], linkedin: ["https://linkedin/", <LinkedIn fontSize='large' />], github: ["https://github.com/", <GitHub fontSize='large' />], instagram: ["https://instagram.com/", <Instagram fontSize='large' />], pinterest: ["https://pinterest.com/", <Pinterest fontSize='large' />] })
    const handleClick = ({ link, id }) => {
        try {
            setLinkClickCounter(id);
        } catch (error) {
            console.error(error);
        }
        finally {
            window.open(link, '_blank');
        }
    }
    return (
        <Box width={"100%"} height={"100%"}>
            <Stack direction="column" justifyContent="center" alignItems="center" width={"100%"} height={"100%"} gap={1} p={1}>
                <Stack direction="column" justifyContent="center" alignItems="center" width={"100%"} py={2} gap={1} flex={0} >
                    <CustomAvatar src={user?.avatar} alt={user?.username} sx={{ width: 80, height: "auto", aspectRatio: 1 }} />
                    <Typography variant="h1" fontSize={45}>{user?.username}</Typography>
                    <Typography variant="body1" fontSize={16}>{user?.description}</Typography>
                    <Stack direction={"row"} gap={1} alignItems={"center"}>
                        {Object.keys(user?.socialNetwork||[])?.map(item => {
                            if (user?.socialNetwork[item]?.length > 0) {
                                return <Link component={Button} variant='inherit' color={"rgb(0,0,0)"} key={item} href={ref.current[item][0] + user?.socialNetwork[item]} target="_blank" >{ref.current[item][1]}</Link>
                            }
                        })}
                    </Stack>
                </Stack>
                <Stack height={"100%"} maxWidth={"md"} width={"100%"} sx={{ overflowY: "auto" }} alignItems={"center"} gap={1} p={1}>
                    {user.links?.length > 0 ? user.links?.map((link) => {
                        return (
                            <Button key={link.id} color='inherit' fullWidth variant='outlined' sx={{ fontWeight: 500, fontSize: 18, }} onClick={() => { handleClick(link) }}>
                                {link.name}
                            </Button>
                        )
                    })
                        :
                        <Typography variant="h2" fontSize={18} fontStyle={"italic"} color={"GrayText"} sx={{ ":first-letter": { textTransform: 'uppercase' } }}>{label("no-links")}</Typography>
                    }
                </Stack>
                <Typography variant="h2" fontSize={12} fontStyle={"italic"} color={"GrayText"} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >{label("footer-userlinks-message")} <Link component={RouterLink} to="/" >{label("here")}</Link> </Typography>
            </Stack>
            <Warning/>
        </Box>
    )
}
const Warning = () => {
    const [check, setCheck] = useState(true);
    return (
        <>
            {check &&
                <Box component={Alert} severity='warning' variant='standard' width={"100%"} position={"fixed"} bottom={0} left={0} height={"auto"} fontSize={12} action={
                    <Button color="inherit" size="small" sx={{ my: "auto" }} onClick={() => { setCheck(false) }}>
                        understood
                    </Button>
                }>
                    <AlertTitle>
                        Accept user aggrement
                    </AlertTitle>
                    By clicking on any link from here you are allowing the collection of information from your device (IP address, browser and any other necessary for analytics purposes).
                </Box>
            }

        </>
    )
}



const LinkA = React.forwardRef((props, ref) => <Paper {...props} ref={ref} />);