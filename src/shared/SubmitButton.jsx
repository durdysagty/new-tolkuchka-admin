import { Box, Button } from "@mui/material"
import config from '../configs/config.json'

export default function SubmitButton(props) {
    return (
        <Box textAlign='end' marginTop={props.marginTop !== undefined ? props.marginTop : 3}>
            <Button type='submit' variant='contained'>{config.text[props.id === '0' || props.pro === 'sim' ? 'add' : props.pro === 'print' ? 'print' : 'edit']}</Button>
        </Box>
    )
}