import { FormControl, FormHelperText, InputLabel, OutlinedInput, Typography } from "@mui/material"

export const CustomInput = (props) => {
    return (
        <FormControl disabled={props?.disabled}>
            <InputLabel error={Boolean(props.error)} >
                {props.label}
            </InputLabel>
            <OutlinedInput
                error={Boolean(props.error)}
                {...props}
            />
            {Boolean(props.error) && <FormHelperText error={Boolean(props.error)} id={props.id} component={Typography} sx={{ ":first-letter": { textTransform: "uppercase" } }}>{props.error}</FormHelperText>}
        </FormControl>
    )
}