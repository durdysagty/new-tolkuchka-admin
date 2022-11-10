import { Box, Typography } from "@mui/material"
import config from '../configs/config.json'
import AddItem from "./AddItem"

export default function PageHeader(props) {
    return (
        <Box>
            <Typography component={'span'} variant='h5'>{props.models !== undefined ? props.models : `${props.id === '0' || props.pro === 'sim' ? config.text.add : config.text.edit} ${props.api === undefined ? '' : config.text[`${props.api}2`]}`}{props.name === undefined ? null : props.name}</Typography>
            {props.path === undefined ?
                null :
                <AddItem path={props.path} />
            }
        </Box>
    )
}