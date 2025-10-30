import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import { Alert, Box, Button, CssBaseline, FormControl, FormHelperText, IconButton, InputLabel, OutlinedInput, Paper, Snackbar, Stack } from '@mui/material'
import { deleteUserLink, getUserLinks, setUserLink, updateUserLink } from '../../firebase/utils';
import { CustomInput } from '../../components/CustomInput';
import { label } from '../../locales/locale'
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Close, Delete } from '@mui/icons-material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
export default function Links() {
    const [links, setLinks] = useState([]);
    const [link, setLink] = useState();
    const [data, setData] = useOutletContext();
    useEffect(() => {
        const fetchLinks = async () => {
            setData((value) => { return { ...value, loading: true } });
            const tempData = data?.links || await getUserLinks();
            setLinks(tempData);
            setData((value) => { return { ...value, userLinks: tempData,loading:false } });
        }
        fetchLinks();
    }, []);

    const handleClick = ({ id }) => {
        setLink(links.find((link) => link.id === id));
    }
    const handleDelete = async ({ id }) => {
        setData(value => { return { ...value, loading: true } })
        const newLinks = links.filter((link) => link.id !== id);
        setLinks(newLinks);
        await deleteUserLink(id);
        setData((value) => { return { ...value, userLinks: newLinks, loading: false } });
    }
    return (
        <>
            <CssBaseline />
            <Stack direction={"column"} height={"100%"} position={"relative"} p={1} gap={2} pb={8}>
                <Typography variant="h1" fontSize={22} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >{label("my-links")}</Typography>
                <Typography variant="h3" fontSize={16} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >{label("my-links-subtitle")}</Typography>
                <InputLink links={links} setLinks={setLinks} selectedLink={link} setSelectedLink={setLink} />
                <LinksList onClick={handleClick} deleteAction={handleDelete} dataList={links} />
            </Stack>
        </>
    )
}


const LinksList = ({ dataList, ...props }) => {
    return (
        <>
            {
                dataList?.map((link, index) => {
                    return (
                        <LinkElement link={link} key={"index" + index} {...props} />
                    )
                })
            }
        </>
    )
}
const LinkElement = ({ link, ...props }) => {
    return (
        <Paper variant='outlined' component={Stack} p={1} direction={"row"} >
            <Box flex={1} onClick={() => { props.onClick(link) }} >
                <Typography variant="h2" fontSize={18} sx={{ ":first-letter": { textTransform: "uppercase" } }} >{link.name}</Typography>
                <Typography variant="h3" fontSize={12}>{link.link}</Typography>
            </Box>
            <IconButton onClick={() => { props.deleteAction(link) }} >
                <Delete />
            </IconButton>
        </Paper>
    )
}
const InputLink = ({ links, setLinks, selectedLink, setSelectedLink }) => {
    const [errors, setErrors] = useState({});
    const [link, setLink] = useState(selectedLink || { name: "", link: "" });
    const navigate = useNavigate();
    const [data, setData] = useOutletContext();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setData((value) => { return { ...value, loading: true } });
        const form = e.target;
        const formData = new FormData(form);
        let tempLink = { ...link }
        if (tempLink.creationTime) {
            tempLink.lastModificationTime = new Date();
        }
        else {
            tempLink.creationTime = new Date();
        }
        const tempErrors = { ...errors };
        form.querySelectorAll('input').forEach(async (input) => {
            switch (input.id) {
                case "link":
                    if (!input.checkValidity() || !validateURL(input.value))
                        tempErrors.link = input.validationMessage || "invalid link follow pattern indicated";
                    else
                        delete tempErrors.link;
                    break;
                default:
                    if (!input.checkValidity())
                        tempErrors[input.id] = input.validationMessage;
                    else
                        delete tempErrors[input.id];
                    break;
            }
        });
        if (tempErrors.name && !tempErrors.link) {
            tempLink.name = getURLSiteName(link.link);
            delete tempErrors.name;
        }
        setErrors(tempErrors);
        if (!Object.keys(tempErrors).length) {
            try {
                let link = {}
                if (!tempLink.id) {
                    link = await setUserLink(tempLink)
                    setLinks([...links, link]);
                    setData((value) => { return { ...value, userLinks: [...links, link] } });
                }
                else {
                    link = await updateUserLink(tempLink);
                    const newLinks = links.map((linkTemp) => {
                        if (linkTemp.id === link.id) {
                            return link;
                        }
                        return linkTemp;
                    })
                    setLinks(links.map((linkTemp) => {
                        if (linkTemp.id === link.id) {
                            return link;
                        }
                        return linkTemp;
                    }))
                    setData((value) => { return { ...value, userLinks: newLinks } });
                    setSelectedLink({ name: "", link: "", creationTime: undefined });
                }
                form.reset();
                setLink({ name: "", link: "", creationTime: undefined });
                setErrors({});
            } catch (error) {
                console.error(error);
                setErrors({ ...errors, global: label(error.code) });
            }
        }
        setData((value) => { return { ...value, loading: false } });
    }

    const validateURL = (url) => {
        const regex = new RegExp(/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i)
        if (!url) return false;
        if (!regex.test(url)) return false;
        return true;
    }

    const getURLSiteName = (url) => {
        const tempUrl = new URL(url);
        const hostname = tempUrl.hostname;
        return hostname.substring(0, hostname.lastIndexOf(".com"));
    }

    useEffect(() => {
        if (selectedLink) {
            setLink(selectedLink);
            setErrors({});
        }
    }, [selectedLink])
    return (<Stack component={"form"} onSubmit={handleSubmit} noValidate gap={2} >
        <CustomInput id="link" label={label("link")} type="text" placeholder="https://google.com" error={errors?.link} autoComplete="off" required value={link.link} onChange={(e) => { setLink({ ...link, link: e.target.value }) }} />
        <CustomInput id="name" label={label("name")} type="text" error={errors?.name} autoComplete="off" required value={link.name} onChange={(e) => { setLink({ ...link, name: e.target.value }) }} />
        <Button variant='contained' type="submit">{label("save")}</Button>
        <Snackbar
            open={Boolean(errors.global)}
            autoHideDuration={10000}
            onClose={() => {
                setErrors((value) => {
                    const temp = { ...value }
                    delete temp.global
                    return temp;
                }
                )
            }}
            message={errors.global || "error"}
            action={
                <>
                    <Button color="secondary" size="small" onClick={() => { (navigate("../profile")) }}>
                        go to profile
                    </Button>
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={() => {
                            setErrors((value) => {
                                const temp = { ...value }
                                delete temp.global
                                return temp;
                            }
                            )
                        }}
                    >
                        <Close fontSize="small" />
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
    </Stack>)
}