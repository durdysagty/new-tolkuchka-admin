import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getEditModel } from '../shared/getData'
import { setJsonData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'

const x = {
    codeName: '',
    priceRate: '',
    realRate: ''
}
const keys = Object.keys(x)

export default function Currency(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [currency, setCurrency] = useState(x)
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
                    setCurrency(result.data)
                else
                    setSubmitError(config.text.wrong)
                setOnce(2)
            }
            if (currency.codeName === '' && once === 1)
                prepareData()
        }
    }, [once, props.api, id, currency.codeName, currency.id])

    function handleChange(e) {
        setCurrency(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
            delete currency.id
            i = '0'
        }
        const response = await setJsonData(props.api, i, currency)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
    }

    return (
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text.codeName} name={keys[0]} onChange={handleChange} value={currency.codeName} required helperText={error ? validation.codeName : ''} error={error && validation.codeName !== '' ? true : false} />
                {keys.slice(-2).map((text, i) => (
                    <TextField type='number' inputProps={{ step: '0.1' }} label={config.text[text]} name={text} onChange={handleChange} value={currency[text]} key={i} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}