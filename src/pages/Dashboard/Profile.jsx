import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { CustomInput } from '../../components/CustomInput'
import { checkUsernameAvailability, createUser, getUser, updateUser } from '../../firebase/utils';
import { getAuth, signOut } from 'firebase/auth';
import { label } from '../../locales/locale';
import { Navigate, redirect, useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';

export default function Profile() {
    const [userData, setUserData] = useState();
    const [formData, setFormData] = useState(useLoaderData());
    const [isNewUser, setIsNewUser] = useState();
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [data, setData] = useOutletContext();
    useEffect(() => {
        const fetchUserData = async () => {
            setData(value => { return { ...value, loading: true } })
            try {
                const tempData = data?.user || await getUser();
                setFormData(tempData);
                setData(value => { return { ...value, user: tempData } })
            } catch (error) {
                setIsNewUser(true);
            }
            finally {
                setData(value => { return { ...value, loading: false } })
            }
        }
        if (getAuth().currentUser) {
            fetchUserData();
        }
    }, [getAuth().currentUser]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setData(value => { return { ...value, loading: true } })
        const form = e.target;
        const tempErrors = { ...errors }
        form.querySelectorAll("input").forEach(async (input) => {
            switch (input.id) {
                case "username":
                    if (!input.checkValidity()) {
                        tempErrors.username = input.validationMessage;
                    }
                    try {
                        await checkUsernameAvailability(input.value)
                        delete tempErrors.username;
                    } catch (error) {
                        tempErrors.username = error.message;
                    }
                    break;
                default:
                    if (!input.checkValidity()) {
                        tempErrors[input.id] = input.validationMessage;
                    }
                    else {
                        delete tempErrors[input.id];
                    }
                    break;
            }
        });
        setErrors(tempErrors);
        if (Object.keys(tempErrors).length === 0) {
            setErrors({});
            if (isNewUser) {
                console.log("create");
                const tempUser = await createUser(formData.username);
                setFormData(tempUser);
                setIsNewUser(false);
            }
            else {
                console.log("update");
                const tempUserData = { ...formData };
                delete tempUserData.id;
                delete tempUserData.email;
                const tempUser = await updateUser(tempUserData);
                setFormData({ ...formData, ...tempUser });
            }
        }
        setData(value => { return { ...value, loading: false } })
    }
    return (
        <Stack height={"100%"} mb={7} gap={2} component={"form"} noValidate onSubmit={handleSubmit} p={1} >
            <Typography variant="h1" fontSize={22} sx={{ ":first-letter": { textTransform: 'uppercase' } }}>{label("my-profile")}</Typography>
            {isNewUser && <Alert severity="warning" >
                {label("warning-message-user")}.
            </Alert>}
            <CustomInput label={label("username")} id="username" name="username" value={formData?.username} error={errors?.username} onChange={(e) => { setFormData({ ...formData, username: e.target.value }) }} required />
            <CustomInput label={label("email")} id="email" name="email" value={formData?.email} disabled onChange={(e) => { setUssetFormDataerData({ ...formData, email: e.target.value }) }} readOnly />
            <Button variant='contained' type='submit'>{label("save")}</Button>
            <Stack direction={"column"} mt={"auto"} gap={2}>
                <Button variant='outlined' type='button' onClick={() => { navigate(`/${formData.username || getAuth().currentUser.uid}`) }} >{label("view-page")}</Button>
                <Button variant='text' color='error' size='small' type='button' onClick={async () => { await signOut(getAuth()); navigate("/") }} >{label("logout")}</Button>
            </Stack>
        </Stack>
    )
}
