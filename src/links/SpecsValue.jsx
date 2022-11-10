import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import ImageUpload from '../shared/ImageUpload'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import Progress from '../shared/Progress'

const x = {
    specId: '',
    nameRu: '',
    nameEn: '',
    nameTm: ''
}
const keys = Object.keys(x)

export default function SpecsValue(props) {

    const { id } = useParams()
    const { parId } = useParams()
    const { name } = useParams()
    const navigate = useNavigate()
    const [specsValue, setSpecsValue] = useState(x)
    const [isImaged, setIsImaged] = useState(null)
    const [image, setImage] = useState(null)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [once, setOnce] = useState(0)

    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            const result = await getData(`${props.dataFrom}/isimaged/${parId}`)
            if (result.ok)
                setIsImaged(result.data)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                const result = await getEditModel(props.api, id)
                if (result.ok)
                    setSpecsValue(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
        }
        if (isImaged === null && once === 1)
            prepareData()
        if (specsValue.specId === '')
            setSpecsValue(prevState => ({ ...prevState, specId: parId }))
    }, [once, props.api, props.dataFrom, isImaged, id, parId, specsValue.id, specsValue.nameRu, specsValue.specId])

    function handleChange(e) {
        if (e.target.name === 'image')
            setImage(e.target.files[0])
        else
            setSpecsValue(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
    }

    function invalid(e) {
        e.preventDefault()
        if (e.target.name === 'image')
            setValidation(prevState => ({
                ...prevState,
                [e.target.name]: config.text.nofile
            }))
        else
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
        const response = await setFormData(props.api, i, specsValue, image === null ? null : [image])
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
    }


    return (isImaged === null ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} name={name} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                {keys.slice(-3).map((text, i) => (
                    <TextField type='text' label={config.text[text]} name={text} onChange={handleChange} value={specsValue[text]} key={i} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                {isImaged ? <ImageUpload required={true} handleChange={handleChange} id={id} error={error} validation={validation} notRequired={true} /> : null}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}