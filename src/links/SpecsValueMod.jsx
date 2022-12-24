import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getEditModel } from '../shared/getData'
import { setJsonData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import Progress from '../shared/Progress'

const x = {
    specsValueId: '',
    nameRu: '',
    nameEn: '',
    nameTm: ''
}
const keys = Object.keys(x)

export default function SpecsValueMod(props) {

    const { id } = useParams()
    const { parId } = useParams()
    const { name } = useParams()
    const navigate = useNavigate()
    const [specsValueMod, setSpecsValueMod] = useState(x)
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
                    setSpecsValueMod(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
            if (specsValueMod.nameRu === '' && once === 1)
                prepareData()
        }
        if (specsValueMod.specsValueId === '')
            setSpecsValueMod(prevState => ({ ...prevState, specsValueId: parId }))
    }, [once, props.api, id, parId, specsValueMod.id, specsValueMod.nameRu, specsValueMod.specsValueId])

    function handleChange(e) {
        setSpecsValueMod(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
        if (pro === 'sim')
            i = '0'
        const response = await setJsonData(props.api, i, specsValueMod)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
    }


    return (id !== '0' && specsValueMod.nameRu === '' ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} name={name} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                {keys.slice(-3).map((text, i) => (
                    <TextField type='text' label={config.text[text]} name={text} onChange={handleChange} value={specsValueMod[text]} key={i} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}