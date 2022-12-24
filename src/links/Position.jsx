import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { getEditModel } from '../shared/getData'
import { setJsonData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import Progress from '../shared/Progress'

const x = {
    name: '',
    level: ''
}
const keys = Object.keys(x)

export default function Position(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [position, setPosition] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [once, setOnce] = useState(0)

    useEffect(() => {
        if (id !== '0') {
            setOnce(1)
            async function prepareData() {
                console.log('prepareData')
                const result = await getEditModel(props.api, id)
                if (result.ok)
                    setPosition(result.data)
                else
                    setSubmitError(config.text.wrong)
                setOnce(2)
            }
            if (position.name === '' && once === 1)
                prepareData()
        }
    }, [once, props.api, id, position.name, position.id])

    function handleChange(e) {
        setPosition(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
    }

    function invalid(e) {
        e.preventDefault()
        if (e.target.validity.valueMissing)
            setValidation(prevState => ({
                ...prevState,
                [e.target.name]: config.text.empty
            }))
        setError(true)
    }

    const [submitError, setSubmitError] = useState('')

    const { pro } = useParams()
    async function submit(e) {
        e.preventDefault()
        let i = id
        if (pro === 'sim') {
            delete position.id
            i = '0'
        }
        const response = await setJsonData(props.api, i, position)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
    }

    return (id !== '0' && position.name === '' ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text.name} name={keys[0]} onChange={handleChange} value={position.name} required helperText={error ? validation.name : ''} error={error && validation.name !== '' ? true : false} />
                <FormControl variant='standard' sx={{ width: '100%' }} required error={error && validation.level !== '' ? true : false}>
                    <InputLabel id='levelSelect'>{config.text.level}</InputLabel>
                    <Select label={config.text.level} labelId='levelSelect' id='selectLevel' value={position.level} onChange={handleChange} name={keys[1]}>
                        {[1, 2, 3, 4].map(r => (
                            <MenuItem key={r} value={r}>{r}</MenuItem>
                        ))}
                    </Select>
                    <FormHelperText error>{error ? validation.level : ''}</FormHelperText>
                </FormControl>
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}