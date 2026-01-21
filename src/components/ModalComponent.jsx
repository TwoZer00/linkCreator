import { Dialog, DialogTitle, Typography, useMediaQuery } from "@mui/material";
import { label } from "../locales/locale";
import { useTheme } from "@emotion/react";


const ModalComponent = ({ children, open, setOpen }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    return (
        <Dialog maxWidth={"md"} fullWidth open={open} onClose={() => setOpen(false)}>
            {children}
        </Dialog>
    )
}

export default ModalComponent