import React, { useEffect, useState } from 'react'
import { Box, Stack, Avatar } from '@mui/material'
import { getDownloadURL, getStorage, ref } from 'firebase/storage'
import { app } from '../firebase/init'

export default function CustomAvatar(props) {
    const [avatar, setAvatar] = useState()
    useEffect(() => {
        const fetchAvatar = async () => {
            const reference = ref(getStorage(app), props.src)
            const url = await getDownloadURL(reference);
            console.log(url);
            setAvatar(url);
        }
        if (typeof (props.src) === "string") {
            fetchAvatar()
        }
        else {
            if (props.src) {
                setAvatar(URL.createObjectURL(props.src));
            }
        }
    }, [props.src])
    return (
        <Avatar {...props} src={avatar} />
    )
}
