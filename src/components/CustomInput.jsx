import { FormControl, FormHelperText, InputLabel, OutlinedInput } from "@mui/material";
import PropTypes from "prop-types";

export const CustomInput = ({ error,disabled=false,fullWidth=false,label,id, ...props }) => {
    return (
        <FormControl disabled={disabled} variant="outlined" fullWidth={fullWidth} >
            <InputLabel htmlFor={id} error={Boolean(error)} sx={{ ":first-letter": { textTransform: "uppercase" } }} >
                {label}
            </InputLabel>
            <OutlinedInput
                fullWidth={fullWidth}
                id={id}
                label={label}
                error={Boolean(error)}
                {...props}
            />
            {Boolean(error) && <FormHelperText error={Boolean(error)} id={id} sx={{ ":first-letter": { textTransform: "uppercase" } }}>{error}.</FormHelperText>}
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