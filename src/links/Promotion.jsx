import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, Checkbox, FormHelperText, Grid, InputLabel, TextField } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import ImageUpload from '../shared/ImageUpload'
import { r } from '../shared/Result'
import AccordionList from '../shared/AccordionList'
import Progress from '../shared/Progress'
import SubmitButton from '../shared/SubmitButton'
import { wait } from '@testing-library/user-event/dist/utils'
import Models from '../shared/Models'

const x = {
    nameRu: '',
    nameEn: '',
    nameTm: '',
    type: '',
    volume: '',
    quantity: '',
    subjectId: '',
    descRu: '',
    descEn: '',
    descTm: '',
    notInUse: false
}
const keys = Object.keys(x)
const type = [
    {
        id: 0,
        name: 'Прямая скидка'
    },
    {
        id: 1,
        name: 'Скидка за количество'
    },
    {
        id: 2,
        name: 'За количество 1 бесплатно'
    },
    {
        id: 3,
        name: 'Подарок'
    },
    {
        id: 4,
        name: 'Подарок за набор'
    },
    {
        id: 5,
        name: 'Скидка за набор'
    },
    {
        id: 6,
        name: 'Специальная скидка за набор'
    }
]

export default function Promotion(props) {
    //#region states
    const { id } = useParams()
    const navigate = useNavigate()
    const [promotion, setPromotion] = useState(x)
    const [imageru, setImageru] = useState(null)
    const [imageen, setImageen] = useState(null)
    const [imagetm, setImagetm] = useState(null)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [subjectId, setSubjectId] = useState([]) // array used for models purpose, b.o. models can be selected by array
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [once, setOnce] = useState(0)
    const [process, setProcess] = useState(false)
    //#endregion
    useEffect(() => {
        if (id !== '0') {
            if (once !== 1)
                setOnce(1)
            async function prepareData() {
                console.log('prepareData')
                let result = await getEditModel(props.api, id)
                if (result.ok) {
                    if (result.data.volume === null)
                        result.data.volume = ''
                    if (result.data.quantity === null)
                        result.data.quantity = ''
                    if (result.data.subjectId === null)
                        result.data.subjectId = ''
                    if (result.data.descRu === null)
                        result.data.descRu = ''
                    if (result.data.descEn === null)
                        result.data.descEn = ''
                    if (result.data.descTm === null)
                        result.data.descTm = ''
                    if (result.data.subjectId !== null)
                        setSubjectId(result.data.subjectId)
                    setPromotion(result.data)
                }
                else
                    setSubmitError(config.text.wrong)
                result = await getData(`${props.api}/products/${id}`)
                if (result.ok)
                    setSelectedProducts(result.data)
                else
                    setSubmitError(config.text.wrong)
                setProcess(false)
            }
            if (promotion.nameRu === '' && once === 1)
                prepareData()
        }
    }, [once, props.api, id, promotion.nameRu, promotion.id, selectedProducts, subjectId, process])
    //#region functions
    function handleChange(e) {
        if (e.target.name === 'imageru')
            setImageru(e.target.files[0])
        else if (e.target.name === 'imageen')
            setImageen(e.target.files[0])
        else if (e.target.name === 'imagetm')
            setImagetm(e.target.files[0])
        else if (e.target.name === keys[3])
            setPromotion(prevState => ({ ...prevState, [e.target.name]: parseInt(e.target.value) }))
        else if (e.target.name === keys[10])
            setPromotion(prevState => ({ ...prevState, [e.target.name]: e.target.checked }))
        else
            setPromotion(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
        console.log(promotion)
    }

    function handleSubject(o, e) {
        setPromotion(prevState => ({ ...prevState, [keys[6]]: o.id }))
        setSubjectId([o.id])
    }

    function handleProducts(o, e) {
        const array = selectedProducts.slice()
        if (e.target.checked) {
            array.push(o.id)
        }
        else {
            array.splice(array.indexOf(e.target.value), 1)
        }
        setSelectedProducts(array)
        console.log(selectedProducts)
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
    //#endregion
    async function submit(e) {
        e.preventDefault()
        setProcess(true)
        if (selectedProducts.length === 0) {
            setSubmitError(promotion.type === 4 ? config.text.noSet : config.text.noProduct)
            setProcess(false)
            return
        }
        if ((promotion.type === 3 || promotion.type === 4) && subjectId.length === 0) {
            setSubmitError(config.text.noPresent)
            setProcess(false)
            return
        }
        await wait(0)
        let i = id
        if (pro === 'sim')
            i = '0'
        let imagesArray = null
        if (imageru !== null || imageen !== null || imagetm !== null)
            imagesArray = [imageru, imageen, imagetm]
        if (promotion.volume !== '') {
            promotion.volume = parseFloat(promotion.volume)
            promotion.volume = promotion.volume.toLocaleString().replace('\u00A0', '')
        }
        const response = await setFormData(props.api, i, promotion, imagesArray, {
            products: selectedProducts.length > 0 ? selectedProducts : null
        })
        if (response.ok) {
            if (response.result === r.success)
                navigate(-1)
            else {
                if (promotion.volume !== '')
                    promotion.volume = promotion.volume.replace(',', '.')
                setSubmitError(config.text.already2)
            }
        }
        else
            setSubmitError(config.text.wrong)
        setProcess(false)
    }

    return ((id !== '0' && promotion.type === '') || process ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                {keys.slice(0, 3).map((text, i) => (
                    <TextField type='text' label={config.text[text]} name={text} onChange={handleChange} value={promotion[text]} key={i} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <AccordionList disabled={id !== '0'} list={type} name={keys[3]} handleChange={handleChange} accId='type3' dtlId='types' req={true} error={error} validation={validation[keys[3]]} id={id !== '0' ? promotion.type : undefined} />
                {promotion.type === 0 || promotion.type === 1 || promotion.type === 5 || promotion.type === 6 ?
                    <TextField type='number' onWheel={e => e.target.blur()} onKeyDown={(e) => ["e", "E", "+", "-", "ArrowDown", "ArrowUp"].includes(e.key) && e.preventDefault()} inputProps={{ step: '0.1' }} label={config.text.discountVolume} name={keys[4]} onChange={handleChange} value={promotion[keys[4]]} required helperText={error ? validation[keys[4]] : ''} error={error && validation[keys[4]] !== '' ? true : false} /> :
                    null
                }
                {promotion.type === 1 || promotion.type === 2 || promotion.type === 3 ?
                    <TextField type='number' onWheel={e => e.target.blur()} onKeyDown={(e) => ["e", "E", "+", "-", ".", ",", "ArrowDown", "ArrowUp"].includes(e.key) && e.preventDefault()} label={config.text.quantityOfProducts} name={keys[5]} onChange={handleChange} value={promotion[keys[5]]} required helperText={error ? validation[keys[5]] : ''} error={error && validation[keys[5]] !== '' ? true : false} /> :
                    null
                }
                {keys.slice(7, 10).map((text, i) => (
                    <TextField key={i} type='text' label={config.text[text]} name={text} onChange={handleChange} value={promotion[text]} multiline />
                ))}
                <InputLabel error={error && (validation.imageru !== '' && validation.imageru !== undefined)}>{config.text.ruVer}</InputLabel>
                <ImageUpload handleChange={handleChange} id={id} error={error} imageName='imageru' validation={validation} required={pro === 'sim' && (imageen !== null || imagetm !== null)} image='promotion' />
                <InputLabel error={error && (validation.imageen !== '' && validation.imageen !== undefined)}>{config.text.enVer}</InputLabel>
                <ImageUpload handleChange={handleChange} id={id} error={error} imageName='imageen' validation={validation} required={pro === 'sim' && (imageru !== null || imagetm !== null)} image='promotion' />
                <InputLabel error={error && (validation.imagetm !== '' && validation.imagetm !== undefined)}>{config.text.tmVer}</InputLabel>
                <ImageUpload handleChange={handleChange} id={id} error={error} imageName='imagetm' validation={validation} required={pro === 'sim' && (imageru !== null || imageen !== null)} image='promotion' />
                <Grid container sx={{ display: 'flex' }}>
                    <Grid item xs={5} sm={2} lg={1}>
                        <InputLabel>{config.text.notInUse}</InputLabel>
                    </Grid>
                    <Checkbox checked={promotion.notInUse} onChange={e => handleChange(e)} name={keys[10]} />
                </Grid>
                <SubmitButton id={id} pro={pro} />
            </Box >
            {promotion.type !== '' ?
                <Models models={config.text.products} api={props.addapi} selectable={true} listName={promotion.type === 4 || promotion.type === 5 || promotion.type === 6 ? config.text.setProducts : config.text.discountedProducts} handleCheck={handleProducts} selectedIds={selectedProducts} /> :
                null
            }
            {promotion.type === 3 || promotion.type === 4 || promotion.type === 6 ?
                <Models models={config.text.products} api={props.addapi} selectable={true} listName={promotion.type === 6 ? config.text.selectSpecial : config.text.selectPresent} handleCheck={handleSubject} selectedIds={[promotion.subjectId]} /> :
                null
            }
        </Box>
    )
}