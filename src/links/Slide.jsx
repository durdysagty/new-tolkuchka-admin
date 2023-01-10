import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, Checkbox, FormHelperText, Grid, InputLabel, TextField } from '@mui/material'
import { getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import ImageUpload from '../shared/ImageUpload'
import { r } from '../shared/Result'
import AccordionList from '../shared/AccordionList'
import Progress from '../shared/Progress'
import SubmitButton from '../shared/SubmitButton'
import { wait } from '@testing-library/user-event/dist/utils'

const x = {
    name: '',
    link: '',
    layout: '',
    notInUse: false
}
const keys = Object.keys(x)
const layout = [
    {
        id: 0,
        name: 'Главная'
    },
    {
        id: 1,
        name: 'Левая'
    }
]

export default function Slide(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [slide, setSlide] = useState(x)
    const [imageru, setImageru] = useState(null)
    const [imageen, setImageen] = useState(null)
    const [imagetm, setImagetm] = useState(null)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [once, setOnce] = useState(0)
    const [process, setProcess] = useState(false)

    useEffect(() => {
        if (id !== '0') {
            setOnce(1)
            async function prepareData() {
                console.log('prepareData')
                const result = await getEditModel(props.api, id)
                if (result.ok)
                    setSlide(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
            if (slide.name === '' && once === 1)
                prepareData()
        }
    }, [once, props.api, id, slide.name, slide.id, process])

    function handleChange(e) {
        if (e.target.name === 'imageru')
            setImageru(e.target.files[0])
        else if (e.target.name === 'imageen')
            setImageen(e.target.files[0])
        else if (e.target.name === 'imagetm')
            setImagetm(e.target.files[0])
        else if (e.target.name === keys[3])
            setSlide(prevState => ({ ...prevState, [e.target.name]: e.target.checked }))
        else
            setSlide(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
    }

    function invalid(e) {
        e.preventDefault()
        if (e.target.name === 'imageru' || e.target.name === 'imageen' || e.target.name === 'imagetm')
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
        setProcess(true)
        await wait(0)
        let i = id
        if (pro === 'sim')
            i = '0'
        let imagesArray = null
        if (imageru !== null || imageen !== null || imagetm !== null)
            imagesArray = [imageru, imageen, imagetm]
        const response = await setFormData(props.api, i, slide, imagesArray)
        if (response.ok) {
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        }
        else
            setSubmitError(config.text.wrong)
        setProcess(false)
    }

    return ((id !== '0' && slide.layout === '') || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                {keys.slice(0, 2).map((text, i) => (
                    <TextField type='text' label={config.text[text]} name={text} onChange={handleChange} value={slide[text]} key={i} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <AccordionList list={layout} name={keys[2]} handleChange={handleChange} accId='layout' dtlId='layouts' req={true} error={error} validation={validation[keys[1]]} id={id !== '0' ? slide.layout : undefined} />
                <InputLabel error={error && (validation.imageru !== '' && validation.imageru !== undefined)}>{config.text.ruVer}</InputLabel>
                <ImageUpload handleChange={handleChange} id={id} error={error} imageName='imageru' validation={validation} required={pro === 'sim' && (imageen !== null || imagetm !== null)} image={slide.layout === '1' ? 'slideleft' : 'slide'} />
                <InputLabel error={error && (validation.imageen !== '' && validation.imageen !== undefined)}>{config.text.enVer}</InputLabel>
                <ImageUpload handleChange={handleChange} id={id} error={error} imageName='imageen' validation={validation} required={pro === 'sim' && (imageru !== null || imagetm !== null)} image={slide.layout === '1' ? 'slideleft' : 'slide'} />
                <InputLabel error={error && (validation.imagetm !== '' && validation.imagetm !== undefined)}>{config.text.tmVer}</InputLabel>
                <ImageUpload handleChange={handleChange} id={id} error={error} imageName='imagetm' validation={validation} required={pro === 'sim' && (imageru !== null || imageen !== null)} image={slide.layout === '1' ? 'slideleft' : 'slide'} />
                <Grid container sx={{ display: 'flex' }}>
                    <Grid item xs={5} sm={2} lg={1}>
                        <InputLabel>{config.text.notInUse}</InputLabel>
                    </Grid>
                    <Checkbox checked={slide.notInUse} onChange={e => handleChange(e)} name={keys[3]} />
                </Grid>
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}