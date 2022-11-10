import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setJsonData } from '../shared/setData'
import Progress from '../shared/Progress'
import AccordionList from '../shared/AccordionList'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'

const x = {
    name: '',
    brandId: ''
}
const keys = Object.keys(x)

export default function Line(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [line, setLine] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [brands, setBrands] = useState(null)
    const [once, setOnce] = useState(0)

    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            if (id !== '0') {
                const result = await getEditModel(props.api, id)
                if (result.ok)
                    setLine(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
            console.log('prepareData')
            const result = await getData(props.dataFrom)
            if (result.ok)
                setBrands(result.data)
            else
                setError(config.text.wrong)
        }
        if (brands === null && once === 1)
            prepareData()
    }, [once, props.api, props.dataFrom, brands, id])

    function handleChange(e) {
        setLine(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
        let i = id
        if (pro === 'sim') {
            delete line.id
            i = '0'
        }
        const response = await setJsonData(props.api, i, line)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
    }


    return (brands === null ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text.name} name={keys[0]} onChange={handleChange} value={line.name} required helperText={error ? validation.name : ''} error={error && validation.name !== '' ? true : false} />
                <AccordionList list={brands} name={keys[1]} handleChange={handleChange} accId='brand' dtlId='brands' req={true} error={error} validation={validation[keys[1]]} id={id !== '0' ? line.brandId : undefined} />
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}