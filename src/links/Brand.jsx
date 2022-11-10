import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import ImageUpload from '../shared/ImageUpload'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'

const x = {
    name: ''
}
const keys = Object.keys(x)

export default function Brand(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [brand, setBrand] = useState(x)
    const [image, setImage] = useState(null)
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
                    setBrand(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
            if (brand.name === '' && once === 1)
                prepareData()
        }
    }, [once, props.api, id, brand.name, brand.id])

    function handleChange(e) {
        if (e.target.name === 'image')
            setImage(e.target.files[0])
        else
            setBrand(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
        const response = await setFormData(props.api, i, brand, image === null ? null : [image])
        if (response.ok) {
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        }
        else
            setSubmitError(config.text.wrong)
    }


    return (
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text.name} name={keys[0]} onChange={handleChange} value={brand.name} required helperText={error ? validation.name : ''} error={error && validation.name !== '' ? true : false} />
                <ImageUpload handleChange={handleChange} id={id} error={error} validation={validation} />
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}