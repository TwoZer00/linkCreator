import React, { useEffect, useState } from 'react'
import { Box, Stack, Avatar } from '@mui/material'
import { getDownloadURL, getStorage, ref } from 'firebase/storage'
import { app } from '../firebase/init'

export default function CustomAvatar(props) {
    const [avatar, setAvatar] = useState()
    const [data, setData] = props.profile;
    useEffect(() => {
        const fetchAvatar = async () => {
            const reference = ref(getStorage(app), props.src)
            const url = await getDownloadURL(reference);
            const user = data.user;
            user.avatar = url;
            setData(value => { return { ...value, user: user } })
        }
        if (typeof (props.src) === "string" && props.src.split("/").includes("avatar")) {
            fetchAvatar();
        }
        else {
            typeof props.src === "object" && setAvatar(URL.createObjectURL(props.src))
        }
    }, [props])
    return (
        <Avatar {...props} src={avatar || props.src} />
    )
}
