import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormHelperText, Grid, InputLabel, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import Progress from '../shared/Progress'
import AccordionList from '../shared/AccordionList'
import { ExpandMore } from '@mui/icons-material'
import ImageUpload from '../shared/ImageUpload'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'

const x = {
    partNo: '',
    categoryId: '',
    typeId: '',
    brandId: '',
    lineId: '',
    modelId: '',
    warrantyId: '',
    price: '',
    newPrice: '',
    notInUse: false,
    isRecommended: false,
    isNew: false,
    onOrder: false
}
const keys = Object.keys(x)
const IMAGESMAX = 5

export default function Product(props) {

    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(x)
    const [productSpecsValues, setProductSpecsValues] = useState([])
    const [productSpecsValueMods, setProductSpecsValueMods] = useState([])
    const [images, setImages] = useState(null)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [categories, setCategories] = useState(null)
    const [selectCats, setSelectCats] = useState(null)
    const [selectedCat, setSelectedCat] = useState('')
    const [selectStepCats, setSelectStepCats] = useState(null)
    const [stepParents, setStepParents] = useState([])
    const [toSelect, setToSelect] = useState(true)
    const [types, setTypes] = useState(null)
    const [brands, setBrands] = useState(null)
    const [lines, setLines] = useState(null)
    const [getLines, setGetLines] = useState(false)
    const [models, setModels] = useState(null)
    const [getModels, setGetModels] = useState(false)
    const [specs, setSpecs] = useState(null)
    const [getSpecs, setGetSpecs] = useState(false)
    const [warranties, setWarranties] = useState(null)
    const [getAdditional, setGetAdditional] = useState(false)
    const [once, setOnce] = useState(0)

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
            result = await getData(`${props.dataFrom[1]}`)
            if (result.ok)
                setTypes(result.data)
            else
                setError(config.text.wrong)
            result = await getData(`${props.dataFrom[2]}`)
            if (result.ok)
                setBrands(result.data)
            else
                setError(config.text.wrong)
            result = await getData(`${props.dataFrom[5]}`)
            if (result.ok)
                setWarranties(result.data)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                result = await getEditModel(props.api, id)
                if (result.ok) {
                    if (result.data.partNo === null)
                        result.data.partNo = ''
                    if (result.data.newPrice === null)
                        result.data.newPrice = ''
                    setProduct(result.data)
                    setToSelect(true)
                    setGetAdditional(true)
                }
                else
                    setSubmitError(config.text.wrong)
                result = await getData(`${props.dataFrom[0]}/productadlinks/${id}`)
                if (result.ok)
                    setStepParents(result.data)
                else
                    setError(config.text.wrong)
                result = await getData(`${props.api}/specvalues/${id}`)
                if (result.ok)
                    setProductSpecsValues(result.data)
                else
                    setSubmitError(config.text.wrong)
                result = await getData(`${props.api}/specvaluemods/${id}`)
                if (result.ok)
                    setProductSpecsValueMods(result.data)
                else
                    setSubmitError(config.text.wrong)
            }
        }
        async function additionalData() {
            if (getAdditional)
                setGetAdditional(false)
            if (getLines || getAdditional) {
                setGetLines(false)
                console.log('getLines')
                let result = await getData(`${props.dataFrom[3]}?brandId=${product.brandId}`)
                if (result.ok)
                    setLines(result.data)
                else
                    setError(config.text.wrong)
                setGetModels(true)
            }
            if (getModels || getAdditional) {
                setGetModels(false)
                console.log('getModels')
                if (product.lineId === null)
                    product.lineId = ''
                let result = await getData(`${props.dataFrom[4]}?brandId=${product.brandId}&lineId=${product.lineId}`)
                if (result.ok)
                    setModels(result.data)
                else
                    setError(config.text.wrong)
            }
            if (getSpecs || getAdditional) {
                setGetSpecs(false)
                console.log('getSpecs')
                let result = await getData(`${props.dataFrom[6]}/value?modelId=${product.modelId}`)
                if (result.ok)
                    setSpecs(result.data)
                else
                    setError(config.text.wrong)
            }
        }
        function selectCategories(categories, stepParent) {
            console.log(`selectCategories ${stepParent}`)
            return categories.map(c => {
                const id = stepParent ? `catStep${c.id}` : `cat${c.id}`
                if (!stepParent && String(product.categoryId) === String(c.id))
                    setSelectedCat(c.name)
                const checkBox = (stepParent && c.id === parseInt(product.categoryId)) || c.level < 2 || c.list.length > 0 ? null : <Checkbox checked={stepParent ? stepParents.includes(String(c.id)) ? true : false : String(product.categoryId) === String(c.id) ? true : false} onClick={e => e.stopPropagation()} onChange={stepParent ? e => handleCheckStep(e) : e => handleCheck(e, c)} name={keys[1]} value={c.id} />
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
                setProduct(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
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
        if (categories === null && once === 1)
            prepareData()
        else if (categories !== null) {
            if (id === '0' || product.id !== '0') {
                if (toSelect) {
                    const selectCats = selectCategories(categories, false)
                    setSelectCats(selectCats)
                    const selectStepCats = selectCategories(categories, true)
                    setSelectStepCats(selectStepCats)
                    setToSelect(false)
                }
            }
        }
        if (product.brandId !== '' && once === 1)
            additionalData()
    }, [once, props.api, props.dataFrom, categories, id, product, stepParents, product.categoryId, toSelect, getLines, getModels, getSpecs, getAdditional])

    function handleChange(e, i) {
        if (e.target.name === 'image') {
            if (id !== '0') {
                if (images === null) {
                    const images = [null, null, null, null, null]
                    images[i] = e.target.files[0]
                    setImages(images)
                }
                else
                    images[i] = e.target.files[0]
            }
            else
                setImages(e.target.files)
        }
        else if (e.target.name === keys[9] || e.target.name === keys[10] || e.target.name === keys[11] || e.target.name === keys[12])
            setProduct(prevState => ({ ...prevState, [e.target.name]: e.target.checked }))
        else
            setProduct(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        setValidation(prevState => ({
            ...prevState,
            [e.target.name]: ''
        }))
        if (e.target.name === 'brandId') {
            setProduct(prevState => ({ ...prevState, lineId: '' }))
            setProduct(prevState => ({ ...prevState, modelId: '' }))
            if (e.target.checked) {
                setGetLines(true)
            }
            if (!e.target.checked) {
                setLines(null)
                setModels(null)
            }
            setSpecs(null)
            setProductSpecsValues([])
        }
        if (e.target.name === 'lineId') {
            setProduct(prevState => ({ ...prevState, modelId: '' }))
            if (e.target.checked)
                setGetModels(true)
            if (!e.target.checked)
                setModels(null)
            setSpecs(null)
            setProductSpecsValues([])
        }
        if (e.target.name === 'modelId') {
            setSpecs(null)
            setProductSpecsValues([])
            setProductSpecsValueMods([])
            if (e.target.checked)
                setGetSpecs(true)
        }
    }

    function handleSpecs(e, id, parentId) {
        if (e.target.name === 'productSpecsValues') {
            const array = productSpecsValues.slice()
            if (e.target.checked) {
                array.push(e.target.value)
            }
            else
                array.splice(array.indexOf(e.target.value), 1)
            if (id !== null && e.target.value !== id) {
                array.splice(array.indexOf(String(id)), 1)
                const array2 = productSpecsValueMods.slice()
                const removePsvm = array2.find(e => e.parentId === id)
                if (removePsvm !== undefined) {
                    const i = array.indexOf(removePsvm)
                    array2.splice(i, 1)
                    setProductSpecsValueMods(array2)
                }
            }
            setProductSpecsValues(array)
        }
        else {
            const array = productSpecsValueMods.slice()
            const psvm = {
                id: e.target.value,
                parentId: parentId
            }
            if (e.target.checked) {
                array.push(psvm)
            }
            else {
                const i = array.indexOf(psvm)
                array.splice(i, 1)
            }
            if (id !== null && e.target.value !== id) {
                const removePsvm = array.find(e => e.parentId === parentId)
                const i = array.indexOf(removePsvm)
                array.splice(i, 1)
            }
            setProductSpecsValueMods(array)
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

    const [submitError, setSubmitError] = useState('')


    const { pro } = useParams()
    async function submit(e) {
        e.preventDefault()
        let i = id
        if (pro === 'sim')
            i = '0'
        let imagesArray = null
        if (images !== null) {
            imagesArray = []
            for (let i = 0; i < IMAGESMAX; i++) {
                if (images[i] === undefined)
                    break
                imagesArray.push(images[i])
            }
        }
        const response = await setFormData(props.api, i, product, imagesArray, {
            adLinks: stepParents.length > 0 ? stepParents : null,
            specsValues: productSpecsValues.length > 0 ? productSpecsValues : null,
            specsValueMods: productSpecsValueMods.length > 0 ? productSpecsValueMods.map(e =>
                e.id
            ) : null
        })
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else
                setSubmitError(config.text.already2)
        else
            setSubmitError(config.text.wrong)
    }

    return ((id !== '0' && product.categoryId === '') || categories === null ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text[keys[0]]} name={keys[0]} onChange={handleChange} value={product[keys[0]]} />
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls='cats' id='cat'>
                        <TextField type='text' label={config.text.category} name={keys[1]} value={selectedCat} required helperText={error ? validation[keys[1]] : ''} error={error && validation[keys[1]] !== '' ? true : false} />
                    </AccordionSummary>
                    <AccordionDetails id='cats'>
                        {selectCats}
                        <Typography variant='h6' sx={{ py: 1 }}>
                            {config.text.stepParents}
                        </Typography>
                        {selectStepCats}
                    </AccordionDetails>
                </Accordion>
                <AccordionList list={types} name={keys[2]} handleChange={handleChange} accId='type' dtlId='types' req={true} error={error} validation={validation[keys[2]]} id={id !== '0' ? product.typeId : undefined} />
                <AccordionList list={brands} name={keys[3]} handleChange={handleChange} accId='brand' dtlId='brands' req={true} error={error} validation={validation[keys[3]]} id={id !== '0' ? product.brandId : undefined} />
                <AccordionList list={lines} name={keys[4]} handleChange={handleChange} accId='line' dtlId='lines' req={false} error={error} validation={validation[keys[4]]} id={id !== '0' ? product.lineId : undefined} />
                <AccordionList list={models} name={keys[5]} handleChange={handleChange} accId='model' dtlId='models' req={true} error={error} validation={validation[keys[5]]} id={id !== '0' ? product.modelId : undefined} />
                <AccordionList list={warranties} name={keys[6]} handleChange={handleChange} accId='warranty' dtlId='warranties' req={true} error={error} validation={validation[keys[6]]} id={id !== '0' ? product.warrantyId : undefined} />
                {keys.slice(7, 9).map((text, i) => (
                    <TextField type='number' inputProps={{ step: '0.01' }} label={config.text[text]} name={text} onChange={handleChange} value={product[text]} key={i} required={i === 0 ? true : false} helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                <Box my={3}>
                    {keys.slice(-4).map((text, i) => (
                        <Grid container key={i} sx={{ display: 'flex' }}>
                            <Grid item xs={5} sm={2} lg={1}>
                                <InputLabel>{config.text[text]}</InputLabel>
                            </Grid>
                            <Checkbox checked={product[text]} onChange={handleChange} name={text} />
                        </Grid>
                    ))}
                </Box>
                <InputLabel>{config.text.specs}</InputLabel>
                {specs === null ? null :
                    <Table size='small'>
                        <TableBody>
                            {specs.map((s, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        {s.name}
                                    </TableCell>
                                    <TableCell>
                                        <AccordionList level={1} name='productSpecsValues' name2='productSpecsValueMods' tableCell={true} list={s.list} checklist={productSpecsValueMods} handleChange={handleSpecs} accId={`${i}x`} dtlId={`${i}s`} id={id !== '0' ? s.list.map(x => x.id).find((e) => {
                                            return productSpecsValues.includes(String(e))
                                        }) : undefined} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                }
                {id === '0' ?
                    <ImageUpload handleChange={handleChange} multiple={true} id={id} error={error} validation={validation} /> :
                    <Grid container mt={3}>
                        {[0, 1, 2, 3, 4].map((i) => {
                            const name = `${id}-${i}.jpg`
                            return (<Grid item mx={1} mb={1} key={i}>
                                <InputLabel id='image' sx={{ cursor: 'pointer', border: 1, borderRadius: '7%', textAlign: 'center' }}>
                                    <img src={`${config.apibase}images/product/small/${name}?w=64&h=64&fit=crop&auto=format`} srcSet={`${config.apibase}images/products/small/${name}?w=64&h=64&fit=crop&auto=format&dpr=2 2x`} alt={`${product.modelId}-${id}-${i}`} style={{ verticalAlign: 'middle' }} onError={e => e.target.src = `${config.apibase}images/0.jpg?w=64&h=64&fit=crop&auto=format`} />
                                    <input name='image' type='file' hidden onChange={e => handleChange(e, i)} accept='image/gif image/png, image/jpeg, image/x-png' />
                                </InputLabel>
                            </Grid>)
                        })}
                    </Grid>
                }
                <SubmitButton id={id} pro={pro} />
            </Box>
        </Box>
    )
}