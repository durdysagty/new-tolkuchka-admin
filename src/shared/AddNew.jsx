import { useState } from 'react'
import { Box, FormHelperText, TextField } from '@mui/material'
import config from '../configs/config.json'
import SmallButton from './SmallButton'


export default function AddNew(props) {

    const [newName, setNewName] = useState('')
    const [submitError, setSubmitError] = useState('')
    //const [objects, setObjects] = useState(props.list)
    //const [newObject] = useState(props.newObject)

    function submit() {
        if (newName !== '') {
            const isExist = props.objects.some(o => o.name === newName)
            if (isExist)
                setSubmitError(config.text.already2)
            else {
                const newObject = structuredClone(props.newObject)
                newObject.name = newName
                const array = props.objects.slice()
                array.push(newObject)
                props.setNew(array)
                setNewName('')
            }
        }
    }
    return (
        <Box margin='auto'>
            <FormHelperText error>{submitError}</FormHelperText>
            <TextField label={config.text[props.label]} value={newName} onChange={e => setNewName(e.target.value)} sx={{ marginY: 0 }} />
            <SmallButton click={submit} id={'0'} />
        </Box>
    )
}