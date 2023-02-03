import { Box, Button } from "@mui/material"
import config from '../configs/config.json'

export default function SmallButton(props) {
    return (
        <Box textAlign='end' marginTop={props.marginTop !== undefined ? props.marginTop : 3}>
            <Button type='button' size='small' variant='outlined' onClick={props.click}>{config.text[props.id === '0' ? 'add' : 'edit']}</Button>
        </Box>
    )
}