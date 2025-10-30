import { FormControl, FormHelperText, InputLabel, OutlinedInput, Typography } from "@mui/material"
import PropTypes from "prop-types";

export const CustomInput = ({ error,disabled=false,fullWidth,label,id, ...props }) => {
    return (
        <FormControl disabled={disabled} fullWidth={fullWidth} variant="outlined">
            <InputLabel variant="outlined" error={Boolean(error)} sx={{ ":first-letter": { textTransform: "uppercase" } }} >
                {label}
            </InputLabel>
            <OutlinedInput
                error={Boolean(error)}
                {...props}
            />
            {Boolean(error) && <FormHelperText error={Boolean(error)} id={id} component={Typography} sx={{ ":first-letter": { textTransform: "uppercase" } }}>{error}.</FormHelperText>}
        </FormControl>
    )
}

CustomInput.propTypes = {
    error: PropTypes.string,
    fullWidth: PropTypes.bool,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
};