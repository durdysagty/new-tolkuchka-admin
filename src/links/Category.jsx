import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormHelperText, Grid, InputLabel, TextField, Typography } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'

const x = {
    nameRu: '',
    nameEn: '',
    nameTm: '',
    order: '',
    parentId: '',
    isForHome: false,
    notInUse: false
}
const keys = Object.keys(x)

export default function Category(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [category, setCategory] = useState(x)
    const [hasProduct, setHasProduct] = useState(false)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [categories, setCategories] = useState(null)
    const [selectCats, setSelectCats] = useState(null)
    const [selectedCat, setSelectedCat] = useState('')
    const [selectStepCats, setSelectStepCats] = useState(null)
    const [stepParents, setStepParents] = useState([])
    const [once, setOnce] = useState(0)

    useEffect(() => {
        setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getData(`${props.api}/tree`)
            if (result.ok)
                setCategories(result.data)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                result = await getEditModel(props.api, id)
                if (result.ok)
                    setCategory(result.data)
                else
                    setSubmitError(config.text.wrong)
                result = await getData(`${props.api}/hasproduct/${id}`)
                if (result.ok)
                    setHasProduct(result.data)
                else
                    setError(config.text.wrong)
                result = await getData(`${props.api}/adlinks/${id}`)
                if (result.ok)
                    setStepParents(result.data)
                else
                    setError(config.text.wrong)
            }
        }
        function selectCategories(categories, stepParent) {
            console.log(`selectCategories ${stepParent}`)
            return categories.map(c => {
                const id = stepParent ? `catStep${c.id}` : `cat${c.id}`
                if (!stepParent && String(category.parentId) === String(c.id))
                    setSelectedCat(c.name)
                const checkBox = stepParent && c.id === parseInt(category.parentId) ? null : hasProduct && c.level === 0 ? null : c.hasProduct ? null : <Checkbox checked={stepParent ? stepParents.includes(String(c.id)) ? true : false : String(category.parentId) === String(c.id) ? true : false} onClick={e => e.stopPropagation()} onChange={stepParent ? e => handleCheckStep(e) : e => handleCheck(e, c)} name={keys[4]} value={c.id} />
                if (c.list.length > 0) {
                    const tree = selectCategories(c.list, stepParent)
                    return <Accordion key={c.id}>
                        <AccordionSummary expandIcon={<ExpandMore />} aria-controls={id} id={`par${id}`} sx={{ display: 'inline-flex' }}>
                            <Typography>
                                {checkBox}
                                {c.name}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails id={id}>
                            {tree}
                        </AccordionDetails>
                    </Accordion>
                }
                else {
                    return <Typography key={c.id} sx={{ display: 'flex', alignItems: 'center' }}>
                        {checkBox}
                        <span>{c.name}</span>
                    </Typography>
                }
            })
        }
        function handleCheck(e) {
            if (e.target.checked) {
                setCategory(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
                setValidation(prevState => ({
                    ...prevState,
                    [e.target.name]: ''
                }))
            }
            else {
                setSelectedCat('')
                setCategory(prevState => ({ ...prevState, [e.target.name]: '' }))
            }
        }
        function handleCheckStep(e) {
            const array = stepParents.slice()
            if (e.target.checked)
                array.push(e.target.value)
            else
                array.splice(array.indexOf(e.target.value), 1)
            setStepParents(array)
        }
        if (categories === null && once === 1)
            prepareData()
        else if (categories !== null) {
            if (id === '0' || category.id !== '0') {
                const selectCats = selectCategories(categories, false)
                setSelectCats(selectCats)
                const selectStepCats = selectCategories(categories, true)
                setSelectStepCats(selectStepCats)
            }
        }
    }, [once, props.api, categories, id, category, stepParents, hasProduct, category.parentId])

    function handleChange(e) {
        if (e.target.name === keys[5] || e.target.name === keys[6])
            setCategory(prevState => ({ ...prevState, [e.target.name]: e.target.checked }))
        else
            setCategory(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
        if (pro === 'sim') {
            delete category.id
            i = '0'
        }
        if (category.parentId === '')
            category.parentId = '0'
        if (category.order === '')
            category.order = '0'
        const response = await setFormData(props.api, i, category, null, stepParents.length > 0 ? {
            adLinks: stepParents
        } : null)
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
                {keys.slice(0, 3).map((text, i) => (
                    <TextField type='text' label={config.text[text]} name={text} onChange={handleChange} value={category[text]} key={i} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <TextField type='number' onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()} label={config.text.order} name={keys[3]} onChange={handleChange} value={category.order} />
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls='cats' id='cat'>
                        <TextField type='text' label={config.text.parent} name={keys[4]} value={selectedCat} />
                    </AccordionSummary>
                    <AccordionDetails id='cats'>
                        {selectCats}
                        <Typography variant='h6' sx={{ py: 1 }}>
                            {config.text.stepParents}
                        </Typography>
                        {selectStepCats}
                    </AccordionDetails>
                </Accordion>
                {keys.slice(-2).map((text, i) => (
                    <Grid container key={i} sx={{ display: 'flex' }}>
                        <Grid item xs={5} sm={2} lg={1}>
                            <InputLabel>{config.text[text]}</InputLabel>
                        </Grid>
                        <Checkbox checked={category[text]} onChange={e => handleChange(e)} name={text} />
                    </Grid>
                ))}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}