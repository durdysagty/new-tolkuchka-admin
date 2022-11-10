import { UploadFile } from "@mui/icons-material"
import { Box, FormControl, FormHelperText, InputLabel } from "@mui/material"

export default function ImageUpload(props) {
    return (
        <FormControl variant='standard' sx={{ width: '100%' }} required={(props.id === '0' && !props.notRequired) || props.required} error={props.imageName === undefined ? props.error && (props.validation.image !== '' && props.validation.image !== undefined) : props.error && (props.validation[props.imageName] !== '' && props.validation[props.imageName] !== undefined)}>
            <InputLabel sx={{ cursor: 'pointer', display: null, transform: 'none' }}>
                <UploadFile />
                <input required={(props.id === '0' && !props.notRequired) || props.required} name={props.imageName === undefined ? 'image' : props.imageName} type='file' hidden multiple={props.multiple === undefined ? false : props.multiple} onChange={props.handleChange} accept='image/gif image/png, image/jpeg, image/x-png' />
            </InputLabel>
            <Box mt={3}>
                <FormHelperText error>{props.error ? props.imageName === undefined ? props.validation.image : props.validation[props.imageName] : ''}</FormHelperText>
            </Box>
        </FormControl>
    )
}