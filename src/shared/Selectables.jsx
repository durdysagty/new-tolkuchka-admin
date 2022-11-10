import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material'
import config from '../configs/config.json'

export default function Selectables(props) {
    return (
        <FormControl variant='standard' sx={{ width: '100%' }} required={props.req} error={props.error && props.validation !== '' ? true : false}>
            <InputLabel id='itemSelect'>{config.text[props.dataFrom]}</InputLabel>
            <Select label={config.text.position} labelId='itemSelect' id='selectItem' value={props.value} onChange={props.handleChange} name={props.name}>
                {props.items?.map(i => (
                    <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                ))}
            </Select>
            <FormHelperText error>{props.error ? props.validation : ''}</FormHelperText>
        </FormControl>
    )
}