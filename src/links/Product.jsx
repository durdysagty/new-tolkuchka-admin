//#region imports
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import config from '../configs/config.json'
import PageHeader from '../shared/PageHeader'
import { Box, Checkbox, FormHelperText, Grid, InputLabel, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material'
import { getData, getEditModel } from '../shared/getData'
import { setFormData } from '../shared/setData'
import Progress from '../shared/Progress'
import AccordionList from '../shared/AccordionList'
import { Close, Warning } from '@mui/icons-material'
import ImageUpload from '../shared/ImageUpload'
import { r } from '../shared/Result'
import SubmitButton from '../shared/SubmitButton'
import { wait } from '@testing-library/user-event/dist/utils'
import AutorenewRotate from '../shared/AutorenewRotate'
//#endregion
const x = {
    partNo: '',
    brandId: '',
    lineId: '',
    modelId: '',
    price: '',
    newPrice: '',
    descRu: '',
    descEn: '',
    descTm: '',
    notInUse: false,
    isRecommended: false,
    isNew: false,
    onOrder: false
}
const keys = Object.keys(x)
const IMAGESMAX = 5

export default function Product(props) {

    //#region states
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(x)
    const [productSpecsValues, setProductSpecsValues] = useState([])
    const [productSpecsValueMods, setProductSpecsValueMods] = useState([])
    const [images, setImages] = useState(null)
    const [validation, setValidation] = useState(x)
    const [error, setError] = useState(false)
    const [brands, setBrands] = useState(null)
    const [lines, setLines] = useState(null)
    const [getLines, setGetLines] = useState(false)
    const [models, setModels] = useState(null)
    const [getModels, setGetModels] = useState(false)
    const [specs, setSpecs] = useState(null)
    const [getSpecs, setGetSpecs] = useState(false)
    const [getAdditional, setGetAdditional] = useState(false)
    const [once, setOnce] = useState(0)
    const [processing, setProcessing] = useState(false)
    //#endregion
    useEffect(() => {
        if (once !== 1)
            setOnce(1)
        async function prepareData() {
            console.log('prepareData')
            let result = await getData(props.dataFrom[2])
            if (result.ok)
                setBrands(result.data.models)
            else
                setError(config.text.wrong)
            if (id !== '0') {
                result = await getEditModel(props.api, id)
                if (result.ok) {
                    if (result.data.partNo === null)
                        result.data.partNo = ''
                    if (result.data.newPrice === null)
                        result.data.newPrice = ''
                    if (result.data.descRu === null)
                        result.data.descRu = ''
                    if (result.data.descEn === null)
                        result.data.descEn = ''
                    if (result.data.descTm === null)
                        result.data.descTm = ''
                    setProduct(result.data)
                    setGetAdditional(true)
                }
                else
                    setSubmitError(config.text.wrong)
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
                let result = await getData(`${props.dataFrom[3]}`, null, { [props.dataFrom[2]]: product.brandId }, "pp=300")
                if (result.ok)
                    setLines(result.data.models)
                else
                    setError(config.text.wrong)
                setGetModels(true)
            }
            if (getModels || getAdditional) {
                setGetModels(false)
                console.log('getModels')
                if (product.lineId === null)
                    product.lineId = ''
                let result = await getData(props.dataFrom[4], null, { [props.dataFrom[2]]: product.brandId, [props.dataFrom[3]]: product.lineId !== '' ? product.lineId : null }, "pp=1000")
                if (result.ok)
                    setModels(result.data.models)
                else
                    setError(config.text.wrong)
                // console.log(result.data.models)
            }
            if (getSpecs || getAdditional) {
                setGetSpecs(false)
                console.log('getSpecs')
                let result = await getData(`${props.dataFrom[6]}/value`, null, { [props.dataFrom[4]]: product.modelId })
                if (result.ok)
                    setSpecs(result.data)
                else
                    setError(config.text.wrong)
            }
        }
        if (brands === null && once === 1)
            prepareData()
        if (product.brandId !== '' && once === 1)
            additionalData()
    }, [once, props.api, props.dataFrom, id, product, brands, getLines, getModels, getSpecs, getAdditional, processing])
    // #region functions
    function handleChange(e, i) {
        if (e.target.name === undefined && id !== '0') {
            if (images === null) {
                const images = [null, null, null, null, null]
                images[i] = false
                setImages(images)
                const imgs = document.getElementsByTagName('img')
                imgs[i].src = `${config.apibase}images/0.jpg?w=64&h=64&fit=crop&auto=format`
            }
            else
                images[i] = false
        }
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
            setProductSpecsValueMods([])
        }
        if (e.target.name === 'lineId') {
            setProduct(prevState => ({ ...prevState, modelId: '' }))
            setModels(null)
            if (!e.target.checked) {
                setProduct(prevState => ({ ...prevState, lineId: '' }))
            }
            setGetModels(true)
            setSpecs(null)
            setProductSpecsValues([])
            setProductSpecsValueMods([])
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
                //if we have other productSpecsValue of this Spec then remove
                const removePsv = array.find(e => e === String(id))
                if (removePsv !== undefined) {
                    const i = array.indexOf(removePsv)
                    array.splice(i, 1)
                }
                const array2 = productSpecsValueMods.slice()
                const removePsvm = array2.find(e => parseInt(e.parentId) === parseInt(id))
                if (removePsvm !== undefined) {
                    const i = array2.indexOf(removePsvm)
                    array2.splice(i, 1)
                    setProductSpecsValueMods(array2)
                }
            }
            else {
                array.splice(array.indexOf(e.target.value), 1)
                const array2 = productSpecsValueMods.slice()
                const removePsvm = array2.find(a => parseInt(a.parentId) === parseInt(e.target.value))
                if (removePsvm !== undefined) {
                    const i = array2.indexOf(removePsvm)
                    array2.splice(i, 1)
                    setProductSpecsValueMods(array2)
                }
            }
            // if (id !== undefined && e.target.value !== String(id)) {
            //     array.splice(array.indexOf(String(id)), 1)
            //     const array2 = productSpecsValueMods.slice()
            //     const removePsvm = array2.find(e => e.parentId === id)
            //     if (removePsvm !== undefined) {
            //         const i = array2.indexOf(removePsvm)
            //         array2.splice(i, 1)
            //         setProductSpecsValueMods(array2)
            //     }
            // }
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
                const removePsvm = array.find(e => e.id === String(id))
                if (removePsvm !== undefined) {
                    const i = array.indexOf(removePsvm)
                    array.splice(i, 1)
                }
            }
            else {
                const i = array.indexOf(array.find(a => a.id === e.target.value))
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
    //#endregion
    async function submit(e) {
        e.preventDefault()
        setProcessing(true)
        await wait(0)
        if (specs.length > productSpecsValues.length) {
            setSubmitError(config.text.notAllSpecs)
            setProcessing(false)
            return
        }
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
        product.price = parseFloat(product.price)
        product.price = product.price.toLocaleString().replace('\u00A0', '')
        if (product.newPrice !== '') {
            product.newPrice = parseFloat(product.newPrice)
            product.newPrice = product.newPrice.toLocaleString().replace('\u00A0', '')
        }
        const response = await setFormData(props.api, i, product, imagesArray, {
            specsValues: productSpecsValues.length > 0 ? productSpecsValues : null,
            specsValueMods: productSpecsValueMods.length > 0 ? productSpecsValueMods.map(e =>
                e.id
            ) : null
        })
        if (response.ok)
            if (response.result === r.success)
                navigate(-1)
            else {
                product.price = product.price.replace(',', '.')
                if (product.newPrice !== '')
                    product.newPrice = product.newPrice.replace(',', '.')
                setSubmitError(config.text.already2)
            }
        else
            setSubmitError(config.text.wrong)
        setProcessing(false)
    }

    return ((id !== '0' && product.brandId === '') || brands === null || processing ?
        <Progress /> :
        <Box>
            <PageHeader id={id} pro={pro} api={props.api} />
            <Box component='form' onSubmit={submit} onInvalid={invalid} margin='auto' >
                <FormHelperText error>{submitError}</FormHelperText>
                <TextField type='text' label={config.text[keys[0]]} name={keys[0]} onChange={handleChange} value={product[keys[0]]} />
                <AccordionList list={brands} name={keys[1]} handleChange={handleChange} accId='brand' dtlId='brands' req={true} error={error} validation={validation[keys[1]]} id={product.brandId} />
                <AccordionList list={lines} name={keys[2]} handleChange={handleChange} accId='line' dtlId='lines' req={false} error={error} validation={validation[keys[2]]} id={product.lineId} />
                <AccordionList list={models} name={keys[3]} handleChange={handleChange} accId='model' dtlId='models' req={true} error={error} validation={validation[keys[3]]} id={product.modelId} />
                {keys.slice(4, 6).map((text, i) => (
                    <TextField type='number' onWheel={e => e.target.blur()} onKeyDown={(e) => ["e", "E", "+", "-", "ArrowDown", "ArrowUp"].includes(e.key) && e.preventDefault()} inputProps={{ step: '0.10' }} label={config.text[text]} name={text} onChange={handleChange} value={product[text]} key={i} required={i === 0 ? true : false} helperText={error ? validation[text] : ''} error={error && validation[text] !== '' ? true : false} />
                ))}
                {keys.slice(6, 9).map((text, i) => (
                    <TextField key={i} type='text' label={config.text[text]} name={text} onChange={handleChange} value={product[text]} multiline />
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
                <Box display='flex'>
                    <InputLabel>{config.text.specs}</InputLabel>
                    <AutorenewRotate update={() => setGetSpecs(true)} />
                </Box>
                {specs === null ? null :
                    <Box mb={2}>
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
                    </Box>
                }
                {id === '0' ?
                    <ImageUpload handleChange={handleChange} multiple={true} id={id} error={error} validation={validation} image='product' /> :
                    <Grid container mt={3}>
                        {[0, 1, 2, 3, 4].map((i) => {
                            const name = `${id}-${i}.jpg`
                            return (<Grid item mx={1} mb={1} key={i}>
                                <Box textAlign='end'>
                                    {
                                        i === 0 ?
                                            <Warning /> :
                                            <Close onClick={e => handleChange(e, i)} sx={{ cursor: 'pointer' }} />
                                    }
                                </Box>
                                <InputLabel sx={{ cursor: 'pointer', border: 1, borderRadius: '7%', textAlign: 'center' }}>
                                    <img src={`${process.env.REACT_APP_API_BASE}images/product/small/${name}?w=64&h=64&fit=crop&auto=format`} srcSet={`${process.env.REACT_APP_API_BASE}images/product/small/${name}?w=64&h=64&fit=crop&auto=format&dpr=2 2x`} alt={`${product.modelId}-${id}-${i}`} style={{ verticalAlign: 'middle' }} onError={e => e.target.src = `${process.env.REACT_APP_API_BASE}images/0.jpg?w=64&h=64&fit=crop&auto=format`} />
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