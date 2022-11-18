import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, FormHelperText, TextField } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import Progress from '../shared/Progress'
import AccordionList from '../shared/AccordionList'
import { r } from '../shared/Result'
import ListMany from '../shared/ListMany'
import SubmitButton from '../shared/SubmitButton'

const x = {
    name: '',
    brandId: '',
    lineId: '',
    descRu: '',
    descEn: '',
    descTm: ''
}
const keys = Object.keys(x)

export default function Model(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [model, setModel] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [brands, setBrands] = useState(null)
    const [lines, setLines] = useState(null)
    const [specs, setSpecs] = useState(null)
    const [selectedSpecs, setSelectedSpecs] = useState([])
    const [once, setOnce] = useState(0)

    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getData(props.dataFrom[0])
            if (result.ok)
                setBrands(result.data)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[2])
            if (result.ok)
                setSpecs(result.data)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                result = await getData(`${props.api}/specs/${id}`)
                if (result.ok)
                    setSelectedSpecs(result.data)
                else
                    setError(config.text.wrong)
                result = await getEditModel(props.api, id)
                if (result.ok)
                    setModel(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
        }
        async function additionalData() {
            console.log('additionalData')
            let result = await getData(`${props.dataFrom[1]}?brand=${model.brandId}`)
            if (result.ok)
                setLines(result.data)
            else
                setError(config.text.wrong)
        }
        if (brands === null && once === 1)
            prepareData()
        if (model.brandId !== '' && once === 1)
            additionalData()
    }, [once, model.brandId, props.api, props.dataFrom, brands, id])

    function handleCheck(array) {
        setSelectedSpecs(array)
    }

    function handleChange(e) {
        setModel(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
            delete model.id
            i = '0'
        }
        const response = await setFormData(props.api, i, model, null, selectedSpecs.length > 0 ? {
            specs: selectedSpecs
        } : null)
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
    }


    return ((id !== '0' && model.brandId === '') || brands === null ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text.name} name={keys[0]} onChange={handleChange} value={model.name} required helperText={error ? validation.name : ''} error={error && validation.name !== '' ? true : false} />
                <AccordionList list={brands} name={keys[1]} handleChange={handleChange} accId='brand' dtlId='brands' req={true} error={error} validation={validation[keys[1]]} id={id !== '0' ? model.brandId : undefined} />
                <AccordionList list={lines} name={keys[2]} handleChange={handleChange} accId='line' dtlId='lines' req={false} error={error} validation={validation[keys[2]]} id={id !== '0' ? model.lineId : undefined} />
                <ListMany list={specs} name='specs' handleChange={handleCheck} mainText='specs' secondText='isNameUse' req={false} checkList={id !== '0' ? selectedSpecs : undefined} />
                {keys.slice(-3).map((text, i) => (
                    <TextField key={i} type='text' label={config.text[text]} name={text} onChange={handleChange} value={model[text]} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}