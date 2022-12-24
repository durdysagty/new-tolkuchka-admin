//#region imports
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormHelperText, TextField, Typography } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import Progress from '../shared/Progress'
import AccordionList from '../shared/AccordionList'
import { r } from '../shared/Result'
import ListMany from '../shared/ListMany'
import SubmitButton from '../shared/SubmitButton'
import { ExpandMore } from '@mui/icons-material'
//#endregion
const x = {
    name: '',
    categoryId: '',
    typeId: '',
    brandId: '',
    lineId: '',
    warrantyId: '',
    descRu: '',
    descEn: '',
    descTm: ''
}
const keys = Object.keys(x)

export default function Model(props) {

    //#region states
    const { id } = useParams()
    const navigate = useNavigate()
    const [model, setModel] = useState(x)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [categories, setCategories] = useState(null)
    const [selectCats, setSelectCats] = useState(null)
    const [selectedCat, setSelectedCat] = useState('')
    const [selectStepCats, setSelectStepCats] = useState(null)
    const [stepParents, setStepParents] = useState(null)
    const [toSelect, setToSelect] = useState(true)
    const [types, setTypes] = useState(null)
    const [brands, setBrands] = useState(null)
    const [lines, setLines] = useState(null)
    const [getLines, setGetLines] = useState(false)
    const [specs, setSpecs] = useState(null)
    const [selectedSpecs, setSelectedSpecs] = useState([])
    const [warranties, setWarranties] = useState(null)
    const [getAdditional, setGetAdditional] = useState(false)
    const [once, setOnce] = useState(0)
    const [search, setSearch] = useState('')
    //#endregion
    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getData(`${props.dataFrom[0]}/tree`)
            if (result.ok)
                setCategories(result.data)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[1])
            if (result.ok)
                setTypes(result.data.models)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[2])
            if (result.ok)
                setBrands(result.data.models)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[4])
            if (result.ok)
                setWarranties(result.data.models)
            else
                setError(config.text.wrong)
            result = await getData(props.dataFrom[5])
            if (result.ok)
                setSpecs(result.data.models)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                result = await getData(`${props.dataFrom[0]}/modeladlinks/${id}`)
                if (result.ok)
                    setStepParents(result.data)
                else
                    setError(config.text.wrong)
                result = await getData(`${props.api}/specs/${id}`)
                if (result.ok)
                    setSelectedSpecs(result.data)
                else
                    setError(config.text.wrong)
                result = await getEditModel(props.api, id)
                if (result.ok) {
                    setModel(result.data)
                    setGetAdditional(true)
                }
                else
                    setSubmitError(config.text.wrong)
            }
            else
                if (stepParents === null)
                    setStepParents([])
        }
        async function additionalData() {
            if (getAdditional)
                setGetAdditional(false)
            if (getLines || getAdditional) {
                setGetLines(false)
                console.log('getLines')
                let result = await getData(`${props.dataFrom[3]}`, null, { [props.dataFrom[2]]: model.brandId })
                if (result.ok)
                    setLines(result.data.models)
                else
                    setError(config.text.wrong)
            }
        }
        function selectCategories(categories, stepParent) {
            return categories.map(c => {
                if (c !== null) {
                    const id = stepParent ? `catStep${c.id}` : `cat${c.id}`
                    if (!stepParent && String(model.categoryId) === String(c.id))
                        setSelectedCat(c.name)
                    const checkBox = (stepParent && c.id === parseInt(model.categoryId)) || c.level < 2 || c.list.length > 0 ? null : <Checkbox checked={stepParent ? stepParents.includes(String(c.id)) ? true : false : String(model.categoryId) === String(c.id) ? true : false} onClick={e => e.stopPropagation()} onChange={stepParent ? e => handleCheckStep(e) : e => handleCheck(e, c)} name={keys[1]} value={c.id} />
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
                }
                else
                    return null
            })
        }
        function handleCheck(e) {
            if (e.target.checked) {
                setModel(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
                setValidation(prevState => ({
                    ...prevState,
                    [e.target.name]: ''
                }))
                setToSelect(true)
            }
        }
        function handleCheckStep(e) {
            const array = stepParents.slice()
            if (e.target.checked)
                array.push(e.target.value)
            else
                array.splice(array.indexOf(e.target.value), 1)
            setStepParents(array)
            setToSelect(true)
        }
        // let searchedCategories = []
        function searchCategories(categories, searchedCategories) {
            console.log('searchCategories')
            categories.forEach(c => {
                if (c.name.toLowerCase().includes(search.toLowerCase()))
                    searchedCategories.push(c)
                else if (c.list.length > 0)
                    searchCategories(c.list, searchedCategories)
            })
            return searchedCategories
        }
        if (categories === null && once === 1)
            prepareData()
        else if (((id !== '0' && model.id !== '0' && model.id !== undefined && toSelect) || (id === '0' && toSelect)) && (categories !== null && stepParents !== null)) {
            setToSelect(false)
            let list = null
            if (search === '')
                list = categories
            else {
                let searchedCategories = []
                searchCategories(categories, searchedCategories)
                list = searchedCategories
            }
            const sc1 = selectCategories(list, false)
            const sc2 = selectCategories(list, true)
            setSelectCats(sc1)
            setSelectStepCats(sc2)
        }
        if (model.brandId !== '' && once === 1)
            additionalData()
    }, [once, props.api, props.dataFrom, brands, categories, id, model, model.brandId, stepParents, model.categoryId, toSelect, selectedSpecs, getAdditional, getLines, search])
    //#region function
    // function handleCheck(array) {
    //     setSelectedSpecs(array)
    // }

    function handleChange(e) {
        setModel(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
        if (e.target.name === 'brandId') {
            setModel(prevState => ({ ...prevState, lineId: '' }))
            if (e.target.checked) {
                setGetLines(true)
            }
            if (!e.target.checked) {
                setLines(null)
            }
        }
    }

    function invalid(e) {
        e.preventDefault()
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: config.text.empty
        }))
        setError(true)
    }

    let searchTimeOut = null
    function changeSearch(e) {
        setSearch(e.target.value)
        // setToSelect(true)
        if (searchTimeOut !== null)
            clearTimeout(searchTimeOut)
        searchTimeOut = setTimeout(() => {
            setToSelect(true)
        }, 2000)
    }
    const [submitError, setSubmitError] = useState('')

    const { pro } = useParams()
    //#endregion
    async function submit(e) {
        e.preventDefault()
        let i = id
        if (pro === 'sim') {
            delete model.id
            i = '0'
        }
        const response = await setFormData(props.api, i, model, null, selectedSpecs.length > 0 ? {
            adLinks: stepParents.length > 0 ? stepParents : null,
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

    return ((id !== '0' && model.brandId === '') || specs === null ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text.name} name={keys[0]} onChange={handleChange} value={model.name} required helperText={error ? validation.name : ''} error={error && validation.name !== '' ? true : false} />
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls='cats' id='cat'>
                        <TextField type='text' label={config.text.category} name={keys[1]} value={selectedCat} required helperText={error ? validation[keys[1]] : ''} error={error && validation[keys[1]] !== '' ? true : false} />
                    </AccordionSummary>
                    <AccordionDetails id='cats'>
                        <TextField value={search} onChange={changeSearch} />
                        {selectCats}
                        <Typography variant='h6' sx={{ py: 1 }}>
                            {config.text.stepParents}
                        </Typography>
                        {selectStepCats}
                    </AccordionDetails>
                </Accordion>
                <AccordionList list={types} name={keys[2]} handleChange={handleChange} accId='type' dtlId='types' req={true} error={error} validation={validation[keys[2]]} id={model.typeId} />
                <AccordionList list={brands} name={keys[3]} handleChange={handleChange} accId='brand' dtlId='brands' req={true} error={error} validation={validation[keys[3]]} id={id !== '0' ? model.brandId : undefined} />
                <AccordionList list={lines} name={keys[4]} handleChange={handleChange} accId='line' dtlId='lines' req={false} error={error} validation={validation[keys[4]]} id={id !== '0' ? model.lineId : undefined} />
                <AccordionList list={warranties} name={keys[5]} handleChange={handleChange} accId='warranty' dtlId='warranties' req={true} error={error} validation={validation[keys[5]]} id={model.warrantyId} />
                <ListMany list={specs} name='specs' selectedSpecs={selectedSpecs} mainText='specs' secondText='isNameUse' req={false} checkList={selectedSpecs} />
                {keys.slice(-3).map((text, i) => (
                    <TextField key={i} type='text' label={config.text[text]} name={text} onChange={handleChange} value={model[text]} required helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <SubmitButton id={id} pro={pro} />
            </Box >
        </Box>
    )
}