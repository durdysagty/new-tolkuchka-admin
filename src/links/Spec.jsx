import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, Checkbox, FormHelperText, Grid, InputLabel, TextField } from '@mui/material'
import { getEditModel } from '../shared/getData'
import { setJsonData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import Progress from '../shared/Progress'
import { wait } from '@testing-library/user-event/dist/utils'

const x = {
    nameRu: '',
    nameEn: '',
    nameTm: '',
    order: 0,
    namingOrder: '',
    isImaged: false,
    isFilter: false
}
const keys = Object.keys(x)

export default function Spec(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [spec, setSpec] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [once, setOnce] = useState('0')
    const [process, setProcess] = useState(false)

    useEffect(() => {
        if (id !== '0') {
            setOnce(1)
            async function prepareData() {
                console.log('prepareData')
                const result = await getEditModel(props.api, id)
                if (result.ok) {
                    if (result.data.namingOrder === null)
                        result.data.namingOrder = ''
                    setSpec(result.data)
                }
                else
                    setSubmitError(config.text.wrong)
            }
            if (spec.nameRu === '' && once === 1)
                prepareData()
        }
    }, [once, props.api, id, spec.nameRu, spec.id, process])

    function handleChange(e) {
        if (e.target.name === keys[5] || e.target.name === keys[6])
            setSpec(prevState => ({ ...prevState, [e.target.name]: e.target.checked }))
        else
            setSpec(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
    }

    function invalid(e) {
        e.preventDefault()
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
        setProcess(true)
        await wait(0)
        let i = id
        if (pro === 'sim') {
            delete spec.id
            i = '0'
        }
        const response = await setJsonData(props.api, i, spec)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
        setProcess(false)
    }


    return ((id !== '0' && spec.isFilter === '') || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                {keys.slice(0, 3).map((text, i) => (
                    <TextField type='text' label={config.text[text]} name={text} onChange={handleChange} value={spec[text]} key={i} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                {keys.slice(3, 5).map((text, i) => (
                    <TextField type='number' required={i === 0} label={config.text[text]} name={text} onChange={handleChange} value={spec[text]} key={i} />
                ))}
                {keys.slice(-2).map((text, i) => (
                    <Box key={i} my={3}>
                        <Grid container sx={{ display: 'flex' }}>
                            <Grid item xs={5} sm={2} lg={1}>
                                <InputLabel>{config.text[text]}</InputLabel>
                            </Grid>
                            <Checkbox checked={spec[text]} onChange={handleChange} name={text} />
                        </Grid>
                    </Box>
                ))}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}