import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import { Alert, Box, Button, FormControl, FormHelperText, IconButton, InputLabel, OutlinedInput, Paper, Snackbar, Stack } from '@mui/material'
import { deleteUserLink, getUserLinks, setUserLink, updateUserLink } from '../../firebase/utils';
import { CustomInput } from '../../components/CustomInput';
import { label } from '../../locales/locale'
import { useNavigate } from 'react-router-dom';
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
    useEffect(() => {
        const fetchLinks = async () => {
            const data = await getUserLinks();
            setLinks(data);
        }
        fetchLinks();
    }, []);

    const handleClick = ({ id }) => {
        setLink(links.find((link) => link.id === id));
    }
    const handleDelete = async ({ id }) => {
        const newLinks = links.filter((link) => link.id !== id);
        setLinks(newLinks);
        await deleteUserLink(id);
    }
    return (
        <>
            <Stack direction={"column"} height={"100%"} mb={7} position={"relative"} p={1} gap={2}>
                <Typography variant="h1" fontSize={22}>My Links</Typography>
                <Typography variant="h3" fontSize={16}>Add your links here</Typography>
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
    const handleSubmit = async (e) => {
        e.preventDefault();
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
                        tempErrors.link = input.validationMessage || "invalid link";
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
                }
                else {
                    link = await updateUserLink(tempLink);
                    setLinks(links.map((linkTemp) => {
                        if (linkTemp.id === link.id) {
                            return link;
                        }
                        return linkTemp;
                    }))
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
        <CustomInput id="link" label="Link" type="text" error={errors?.link} autoComplete="off" required value={link.link} onChange={(e) => { setLink({ ...link, link: e.target.value }) }} />
        <CustomInput id="name" label="Name" type="text" error={errors?.name} autoComplete="off" required value={link.name} onChange={(e) => { setLink({ ...link, name: e.target.value }) }} />
        <Button variant='contained' type="submit">save</Button>
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