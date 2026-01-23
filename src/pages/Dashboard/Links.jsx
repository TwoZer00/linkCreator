import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Snackbar, Stack } from '@mui/material';
import { deleteUserLink, getUserLinks, setUserLink, updateUserLink } from '../../firebase/utils';
import { CustomInput } from '../../components/CustomInput';
import { label } from '../../locales/locale';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Close, Delete, Edit } from '@mui/icons-material';

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
        setLinks(data.userLinks || []);
    }, [data.userLinks]);

    const handleClick = ({ id }) => {
        setLink(links.find((link) => link.id === id));
    }
    const handleDelete = async ({ id }) => {
        setData(value => { return { ...value, loading: true } })
        const newLinks = links.filter((link) => link.id !== id);
        const newvisits = data.user.links.visits || { total: 0, byCountry: [], byDevice: [] };
        const linkToDelete = links.find((link) => link.id === id);
        if (linkToDelete?.visits) {
            newvisits.total -= linkToDelete.visits.total || 0;
            // Adjust byCountry
            linkToDelete.visits.byCountry?.forEach((countryVisit) => {
                const existingCountry = newvisits.byCountry.find(item => item.country === countryVisit.country);
                if (existingCountry) {
                    existingCountry.count -= countryVisit.count;
                    if (existingCountry.count <= 0) {
                        newvisits.byCountry = newvisits.byCountry.filter(item => item.country !== countryVisit.country);
                    }
                }
            });
            // Adjust byDevice
            linkToDelete.visits.byDevice?.forEach((deviceVisit) => {
                const existingDevice = newvisits.byDevice.find(item => item.device === deviceVisit.device);
                if (existingDevice) {
                    existingDevice.count -= deviceVisit.count;
                    if (existingDevice.count <= 0) {
                        newvisits.byDevice = newvisits.byDevice.filter(item => item.device !== deviceVisit.device);
                    }
                }
            });
        }
        setLinks(newLinks);
        await deleteUserLink(id);
        setData(
            (value)=>{
                return {...value, userLinks: newLinks, user:{...value.user,links:{...value.user.links,visits:value.user.links.visits,total:(value.user.links.total||0)-1}},loading:false}
            }
        )
    }
    return (
        <>
            <Stack direction={"column"} maxHeight={"100%"} p={1} gap={2}>
                <Typography variant="h1" fontSize={22} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >{label("my-links")}</Typography>
                <Typography variant="h3" fontSize={16} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >{label("my-links-subtitle")}</Typography>
                <InputLink />
                <LinksList onClick={handleClick} deleteAction={handleDelete} />
            </Stack>
        </>
    )
}
const LinksList = ({ ...props }) => {
    const [links,setLinks ]=useState([]);
    const [data, setData] = useOutletContext();
    useEffect(() => {
        const fetchLinks = async () => {
            setData((value) => { return { ...value, loading: true } });
            const tempData = data?.userLinks || await getUserLinks();
            setLinks(tempData);
            setData((value) => { return { ...value, userLinks: tempData, loading: false } });
        }

        fetchLinks();
    })
    return (
        <Box flex={1} height={"100%"} overflow={"auto"} display={"flex"} flexDirection={"column"} gap={2} >
            {
                links?.map((link, index) => {
                    return (
                        <LinkElement link={link} key={"index" + index} {...props} />
                    )
                })
            }
        </Box>
    )
}
const LinkElement = ({ link, ...props }) => {
    const [modal,setModal] = useState({edit:false,delete:false});
    return (
        <>
            <Paper variant='outlined' component={Stack} p={1} direction={"row"} >
                <Box flex={1} onClick={() => { props.onClick(link) }} >
                    <Typography variant="h2" fontSize={18} sx={{ ":first-letter": { textTransform: "uppercase" } }} >{link.name}</Typography>
                    <Typography variant="h3" fontSize={12}>{link.link}</Typography>
                </Box>
                <IconButton onClick={() => { setModal(value => ({...value,delete:true})) }} >
                    <Delete />
                </IconButton>
                <IconButton onClick={() => { setModal((value)=>({...value, edit:true})) }} >
                    <Edit />
                </IconButton>
            </Paper>
            <DeleteLink action={props.deleteAction} open={modal.delete} setOpen={setModal} link={link}/>
            <EditLink open={modal.edit} setOpen={setModal} link={link} />
        </>
    )
}
const EditLink = ({ open, setOpen, link }) => {
    return (
        <Dialog open={open} onClose={() => { setOpen(value=>({...value, edit:false})) }}>
            <DialogTitle sx={{ ":first-letter": { textTransform: "uppercase" } }}>{label("edit-link")}</DialogTitle>
            <DialogContent>
                <Box p={2}>
                    <InputLink updatedLink={[link,setOpen]}   />
                </Box>
            </DialogContent>
        </Dialog>
    )

}
const DeleteLink = ({ action,open, setOpen, link }) => {
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
        <Dialog open={open} onClose={() => { setOpen(value=>({...value, delete:false})) }}>
            <DialogTitle sx={{ ":first-letter": { textTransform: "uppercase" } }}>{label("delete-link")}</DialogTitle>
            <DialogContent>
                <Box>
                    <Typography sx={{':first-letter':{textTransform:'uppercase'}}}>{label("delete-link-message")}</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color='error' onClick={() => { setOpen(value=>({...value, delete:false})) }}>{label("cancel")}</Button>
                <Button color='error' variant='contained' onClick={() => { action(link); setOpen(value=>({...value, delete:false})) }} autoFocus>
                    {label("accept")}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
// const InputLink = ({ links, setLinks, selectedLink, setSelectedLink }) => {
const InputLink = ({updatedLink=[]}) => {
    const [errors, setErrors] = useState({});
    const [link, setLink] = useState(updatedLink[0] || { name: "", link: "" });
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
                        tempErrors.link = input.validationMessage || label("invalid-link-pattern");
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
            let resolveLink = {};
            try {
                if (updatedLink[0]) {
                    resolveLink = await updateUserLink({ ...tempLink, id: updatedLink[0].id });
                    setData((value) => {
                        const tempLinks = value.userLinks || [];
                        return {
                            ...value,
                            userLinks: tempLinks.map((link) => link.id === resolveLink.id ? resolveLink : link)
                        }
                    });
                    updatedLink[1](value=>({...value,edit:false}));
                }
                else{
                    resolveLink = await setUserLink(tempLink)
                    setData((value) => {
                        const tempLinks = value.userLinks || [];
                        const links = value.user.links;
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
                    });
                }
                form.reset();
                setLink({ name: "", link: "" });
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
    return (<Stack component={"form"} onSubmit={handleSubmit} noValidate gap={2} >
        <CustomInput id="link" label={label("link")} type="text" placeholder="https://google.com" error={errors?.link} autoComplete="off" required value={link.link} onChange={(e) => { setLink({ ...link, link: e.target.value }) }} />
        <CustomInput id="name" label={label("name")} type="text" error={errors?.name} autoComplete="off" required value={link.name} onChange={(e) => { setLink({ ...link, name: e.target.value }) }} />
        <Button variant='contained' type="submit">{label("save")}</Button>
        {
            updatedLink[0] && (
                <Button variant='outlined' onClick={() => {
                    updatedLink[1](value=>({...value,edit:false}));
                }}>{label("cancel")}</Button>
            )
        }
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