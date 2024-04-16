import { FormControl, FormHelperText, InputLabel, OutlinedInput, Typography } from "@mui/material"

export const CustomInput = ({ error, ...props }) => {
    return (
        <FormControl disabled={props?.disabled} fullWidth={props.fullWidth}>
            <InputLabel error={Boolean(error)} sx={{ ":first-letter": { textTransform: "uppercase" } }} >
                {props.label}
            </InputLabel>
            <OutlinedInput
                error={Boolean(error)}
                {...props}
            />
            {Boolean(error) && <FormHelperText error={Boolean(error)} id={props.id} component={Typography} sx={{ ":first-letter": { textTransform: "uppercase" } }}>{error}.</FormHelperText>}
        </FormControl>
    )
}