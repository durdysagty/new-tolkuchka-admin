import { Box, Typography } from "@mui/material"
import config from '../configs/config.json'
import AddItem from "./AddItem"

export default function PageHeader(props) {
    return (
        <Box display='flex' >
            <Typography component={'span'} variant='h5'>{props.text !== undefined ? props.text : props.models !== undefined ? props.models : `${props.id === '0' || props.pro === 'sim' ? config.text.add : props.pro === 'print' ? config.text.print : props.pro === 'process' ? config.text.process : config.text.edit} ${props.api === undefined ? '' : config.text[`${props.api}2`]}`}{props.name === undefined ? null : props.name}</Typography>
            {props.path === undefined ?
                null :
                <AddItem path={props.path} />
            }
        </Box>
    )
}